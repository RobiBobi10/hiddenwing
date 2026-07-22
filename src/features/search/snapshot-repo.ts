// Thin persistence of a search + its offers (ADR-0009). Cheap, and both M3
// (rank the stored offers) and M6 (re-validate against them) need it.

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { NormalizedQuery } from "@/domain/providers/provider-port";
import type { NormalizedOffer } from "@/domain/offer/offer";

export async function saveSearchSnapshot(
  query: NormalizedQuery,
  offers: NormalizedOffer[],
  provider: string,
  userId?: string | null,
): Promise<void> {
  await db.search.create({
    data: {
      userId: userId ?? null,
      origin: query.origin,
      destination: query.destination,
      departureDate: query.departureDate,
      returnDate: query.returnDate,
      adults: query.passengers.adults,
      children: query.passengers.children,
      infants: query.passengers.infants,
      cabinClass: query.cabinClass,
      provider,
      offerCount: offers.length,
      offers: {
        create: offers.map((o) => ({
          providerOfferId: o.id,
          provider: o.provider,
          totalAmount: o.totalAmount,
          currency: o.currency,
          owner: o.owner,
          cabinClass: o.cabinClass,
          stops: o.slices[0]?.stops ?? 0,
          normalized: o as unknown as Prisma.InputJsonValue,
          fetchedAt: new Date(o.fetchedAt),
        })),
      },
    },
  });
}
