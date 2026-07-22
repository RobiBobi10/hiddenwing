// PURE: score every offer, compute the cheapest/fastest/best-value anchors, tag them,
// and return the list ordered best-value-first. Same inputs + preferences → same order
// (reproducible, NFR-13).

import type { NormalizedOffer } from "@/domain/offer/offer";
import type { Preferences } from "./preferences";
import { DEFAULT_PREFERENCES } from "./preferences";
import { scoreOffer, type ScoredOffer } from "./ttv";

export interface Anchors {
  cheapestId: string | null; // lowest fare
  fastestId: string | null; // shortest total duration
  bestValueId: string | null; // highest TTV
}

export interface RankResult {
  scored: ScoredOffer[];
  anchors: Anchors;
}

export function rankOffers(
  offers: NormalizedOffer[],
  prefs: Preferences = DEFAULT_PREFERENCES,
): RankResult {
  const scored = offers.map((o) => scoreOffer(o, prefs));

  let cheapest: ScoredOffer | null = null;
  let fastest: ScoredOffer | null = null;
  let bestValue: ScoredOffer | null = null;
  for (const s of scored) {
    if (!cheapest || s.offer.totalAmount < cheapest.offer.totalAmount) cheapest = s;
    if (!fastest || s.metrics.totalDurationMinutes < fastest.metrics.totalDurationMinutes) {
      fastest = s;
    }
    if (!bestValue || s.ttv > bestValue.ttv) bestValue = s;
  }

  const anchors: Anchors = {
    cheapestId: cheapest?.offer.id ?? null,
    fastestId: fastest?.offer.id ?? null,
    bestValueId: bestValue?.offer.id ?? null,
  };

  for (const s of scored) {
    if (s.offer.id === anchors.bestValueId) s.tags.unshift("Best value");
    if (s.offer.id === anchors.cheapestId) s.tags.push("Cheapest");
    if (s.offer.id === anchors.fastestId) s.tags.push("Fastest");
  }

  // Best value first; stable tiebreak by lower fare.
  scored.sort((a, b) => b.ttv - a.ttv || a.offer.totalAmount - b.offer.totalAmount);

  return { scored, anchors };
}
