// PURE normalization: a Duffel offer -> our common offer model.
// Deliberately free of the SDK and of any I/O so it is trivially unit-testable.
// This is the highest-value code in M2: M3 ranking and M6 re-validation both
// trust these normalized fields, so correctness here matters most.

import type {
  NormalizedOffer,
  NormalizedSlice,
  NormalizedSegment,
  NormalizedBaggage,
} from "@/domain/offer/offer";

// --- Minimal shapes we read from a Duffel offer (not the full SDK type) ---
interface DuffelPlace {
  iata_code?: string | null;
  name?: string | null;
  city_name?: string | null;
}
interface DuffelCarrier {
  name?: string | null;
  iata_code?: string | null;
  logo_symbol_url?: string | null;
}
interface DuffelBaggage {
  type?: string | null; // "checked" | "carry_on"
  quantity?: number | null;
}
interface DuffelSegmentPassenger {
  cabin_class?: string | null;
  cabin_class_marketing_name?: string | null;
  baggages?: DuffelBaggage[] | null;
}
interface DuffelSegment {
  origin?: DuffelPlace | null;
  destination?: DuffelPlace | null;
  departing_at?: string | null;
  arriving_at?: string | null;
  duration?: string | null;
  marketing_carrier?: DuffelCarrier | null;
  marketing_carrier_flight_number?: string | null;
  passengers?: DuffelSegmentPassenger[] | null;
}
interface DuffelSlice {
  origin?: DuffelPlace | null;
  destination?: DuffelPlace | null;
  duration?: string | null;
  segments?: DuffelSegment[] | null;
}
export interface DuffelOfferInput {
  id: string;
  total_amount?: string | null;
  total_currency?: string | null;
  owner?: DuffelCarrier | null;
  expires_at?: string | null;
  slices?: DuffelSlice[] | null;
}

/** Parse an ISO-8601 duration (e.g. "PT7H30M", "P1DT2H", "PT45M") to minutes. */
export function parseIsoDurationToMinutes(iso: string | null | undefined): number {
  if (!iso) return 0;
  const m = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/.exec(iso);
  if (!m) return 0;
  const days = Number(m[1] ?? 0);
  const hours = Number(m[2] ?? 0);
  const mins = Number(m[3] ?? 0);
  return days * 24 * 60 + hours * 60 + mins;
}

function placeName(p: DuffelPlace | null | undefined): string | undefined {
  return p?.city_name ?? p?.name ?? undefined;
}

function mapSegment(seg: DuffelSegment): NormalizedSegment {
  return {
    origin: seg.origin?.iata_code ?? "",
    destination: seg.destination?.iata_code ?? "",
    originName: placeName(seg.origin),
    destinationName: placeName(seg.destination),
    departingAt: seg.departing_at ?? "",
    arrivingAt: seg.arriving_at ?? "",
    durationMinutes: parseIsoDurationToMinutes(seg.duration),
    marketingCarrier: seg.marketing_carrier?.name ?? "Unknown",
    marketingCarrierCode: seg.marketing_carrier?.iata_code ?? "",
    flightNumber: seg.marketing_carrier_flight_number ?? undefined,
  };
}

function mapSlice(slice: DuffelSlice): NormalizedSlice {
  const segments = (slice.segments ?? []).map(mapSegment);
  return {
    origin: slice.origin?.iata_code ?? segments[0]?.origin ?? "",
    destination:
      slice.destination?.iata_code ?? segments[segments.length - 1]?.destination ?? "",
    originName: placeName(slice.origin) ?? segments[0]?.originName,
    destinationName:
      placeName(slice.destination) ?? segments[segments.length - 1]?.destinationName,
    durationMinutes: parseIsoDurationToMinutes(slice.duration),
    stops: Math.max(0, segments.length - 1),
    segments,
  };
}

function extractBaggage(offer: DuffelOfferInput): NormalizedBaggage {
  // Baggage lives per segment, per passenger. Take the max seen across the offer
  // as a best-effort "included" figure (M2 prices are indicative only).
  let checked = 0;
  let carryOn = 0;
  for (const slice of offer.slices ?? []) {
    for (const seg of slice.segments ?? []) {
      for (const pax of seg.passengers ?? []) {
        for (const bag of pax.baggages ?? []) {
          const q = bag.quantity ?? 0;
          if (bag.type === "checked") checked = Math.max(checked, q);
          if (bag.type === "carry_on") carryOn = Math.max(carryOn, q);
        }
      }
    }
  }
  return { checkedBags: checked, carryOnBags: carryOn };
}

function firstCabinClass(offer: DuffelOfferInput): string {
  for (const slice of offer.slices ?? []) {
    for (const seg of slice.segments ?? []) {
      for (const pax of seg.passengers ?? []) {
        if (pax.cabin_class) return pax.cabin_class;
      }
    }
  }
  return "economy";
}

export function mapDuffelOffer(offer: DuffelOfferInput, fetchedAt: string): NormalizedOffer {
  return {
    id: offer.id,
    provider: "duffel",
    totalAmount: Number(offer.total_amount ?? 0),
    currency: offer.total_currency ?? "",
    owner: offer.owner?.name ?? "Unknown",
    ownerCode: offer.owner?.iata_code ?? "",
    ownerLogoUrl: offer.owner?.logo_symbol_url ?? null,
    cabinClass: firstCabinClass(offer),
    slices: (offer.slices ?? []).map(mapSlice),
    baggage: extractBaggage(offer),
    expiresAt: offer.expires_at ?? null,
    fetchedAt,
  };
}
