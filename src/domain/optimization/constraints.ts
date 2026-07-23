// PURE: hard constraints eliminate offers BEFORE ranking (doc 12 §5). Soft
// preferences (weights) only tilt the score; hard constraints remove options
// entirely ("never a red-eye", "at most N stops").

import type { NormalizedOffer } from "@/domain/offer/offer";
import { deriveMetrics } from "./metrics";

export interface HardConstraints {
  noRedEye: boolean;
  maxStops: number | null; // null = no limit
}

export const DEFAULT_CONSTRAINTS: HardConstraints = {
  noRedEye: false,
  maxStops: null,
};

export interface FilterResult {
  kept: NormalizedOffer[];
  removed: number;
}

export function applyHardConstraints(
  offers: NormalizedOffer[],
  c: HardConstraints,
): FilterResult {
  if (!c.noRedEye && c.maxStops === null) return { kept: offers, removed: 0 };

  const kept = offers.filter((o) => {
    const m = deriveMetrics(o);
    if (c.noRedEye && m.isRedEye) return false;
    if (c.maxStops !== null && m.totalStops > c.maxStops) return false;
    return true;
  });

  return { kept, removed: offers.length - kept.length };
}
