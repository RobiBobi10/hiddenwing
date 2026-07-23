// Duffel implementation of ProviderPort: maps our NormalizedQuery to a Duffel
// offer request, then normalizes the returned offers via the pure mapper.

import type { ProviderPort, NormalizedQuery, PriceCheck } from "@/domain/providers/provider-port";
import type { NormalizedOffer } from "@/domain/offer/offer";
import { getDuffelClient } from "./duffel-client";
import { mapDuffelOffer, type DuffelOfferInput } from "./duffel-mapper";

type DuffelPassenger = { type: "adult" } | { age: number };

export class DuffelAdapter implements ProviderPort {
  readonly name = "duffel";

  async search(query: NormalizedQuery): Promise<NormalizedOffer[]> {
    const duffel = getDuffelClient();

    const slices: Array<{ origin: string; destination: string; departure_date: string }> = [
      {
        origin: query.origin,
        destination: query.destination,
        departure_date: query.departureDate,
      },
    ];
    if (query.returnDate) {
      slices.push({
        origin: query.destination,
        destination: query.origin,
        departure_date: query.returnDate,
      });
    }

    // Duffel accepts { type: "adult" } and age-based passengers for children/infants.
    const passengers: DuffelPassenger[] = [
      ...Array.from({ length: query.passengers.adults }, () => ({ type: "adult" as const })),
      ...Array.from({ length: query.passengers.children }, () => ({ age: 10 })),
      ...Array.from({ length: query.passengers.infants }, () => ({ age: 1 })),
    ];

    const requestBody = {
      slices,
      passengers,
      cabin_class: query.cabinClass,
    };

    // The SDK's create() input type is stricter than we need; the double-cast keeps
    // typecheck green without depending on the SDK's exact exported shape. Offers are
    // included in the response by default (Duffel's return_offers defaults to true).
    const response = await duffel.offerRequests.create(
      requestBody as unknown as Parameters<typeof duffel.offerRequests.create>[0],
    );

    const fetchedAt = new Date().toISOString();
    const offers = (response.data.offers ?? []) as unknown as DuffelOfferInput[];
    return offers.map((o) => mapDuffelOffer(o, fetchedAt));
  }

  // Re-validate a single offer live before any booking handoff. Duffel offers
  // expire; a fetch that fails or is past its expiry means "no longer bookable".
  async price(offerId: string): Promise<PriceCheck> {
    const checkedAt = new Date().toISOString();
    try {
      const duffel = getDuffelClient();
      const res = await duffel.offers.get(offerId);
      const offer = res.data as unknown as {
        total_amount?: string | null;
        total_currency?: string | null;
        expires_at?: string | null;
      };
      const expiresAt = offer.expires_at ?? null;
      const stillValid = !expiresAt || Date.parse(expiresAt) > Date.now();
      return {
        available: stillValid,
        totalAmount: offer.total_amount != null ? Number(offer.total_amount) : undefined,
        currency: offer.total_currency ?? undefined,
        expiresAt,
        checkedAt,
      };
    } catch {
      // 404 / expired / network → treat as no longer available.
      return { available: false, checkedAt };
    }
  }
}
