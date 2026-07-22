// PURE: a deterministic Comfort Score, 0–100. Derived only from fields we actually
// have (cabin, stops, red-eye, duration, layover). Seat pitch and on-time record
// aren't available in Duffel test mode — hooks for them can be added later without
// changing the interface. NEVER AI-generated (see glossary / ADR-0006).

import type { NormalizedOffer } from "@/domain/offer/offer";
import type { OfferMetrics } from "./metrics";

const CABIN_BONUS: Record<string, number> = {
  economy: 0,
  premium_economy: 12,
  business: 25,
  first: 35,
};

export function comfortScore(offer: NormalizedOffer, metrics: OfferMetrics): number {
  let score = 60; // neutral baseline for a plain economy direct

  score += CABIN_BONUS[offer.cabinClass] ?? 0;
  score -= metrics.totalStops * 12; // each connection reduces comfort
  if (metrics.isRedEye) score -= 15;
  if (metrics.totalDurationMinutes > 12 * 60) score -= 10; // very long trips
  if (metrics.totalLayoverMinutes > 3 * 60) score -= 8; // long layovers

  return Math.max(0, Math.min(100, Math.round(score)));
}
