// PURE: score one offer by Total Trip Value. Additive, all-monetary utility so every
// trade-off is commensurable and explainable (doc 12). Higher TTV = better; the value
// is typically negative because it's a net cost. Every term is retained in `breakdown`
// so M4's explanations can cite real numbers.

import type { NormalizedOffer } from "@/domain/offer/offer";
import type { Preferences } from "./preferences";
import { deriveMetrics, type OfferMetrics } from "./metrics";
import { comfortScore } from "./comfort";

export interface TtvBreakdown {
  fare: number; // raw offer price
  addedBagFee: number; // estimated fee for missing checked bags
  effectivePrice: number; // fare + addedBagFee
  timeCost: number; // travel time valued at value-of-time
  stopPenalty: number;
  layoverPenalty: number;
  redEyePenalty: number;
  comfortValue: number; // + above neutral comfort, − below
  ttv: number; // sum of the above (price/penalties negative, comfort ±)
}

export interface ScoredOffer {
  offer: NormalizedOffer;
  ttv: number;
  comfortScore: number;
  metrics: OfferMetrics;
  breakdown: TtvBreakdown;
  reasons: string[]; // short, human-readable, deterministic
  tags: string[]; // "Direct" here; anchors ("Best value"…) added by rank()
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function scoreOffer(offer: NormalizedOffer, prefs: Preferences): ScoredOffer {
  const metrics = deriveMetrics(offer);
  const comfort = comfortScore(offer, metrics);

  const fare = offer.totalAmount;
  const missingBags = Math.max(0, prefs.checkedBagsNeeded - metrics.checkedBags);
  const addedBagFee = missingBags * prefs.estimatedBagFee;
  const effectivePrice = fare + addedBagFee;

  const timeCost = (metrics.totalDurationMinutes / 60) * prefs.valueOfTimePerHour;
  const stopPenalty = metrics.totalStops * prefs.perStopPenalty;

  const longLayoverHours = Math.max(
    0,
    metrics.totalLayoverMinutes / 60 - prefs.comfortableLayoverHours,
  );
  const layoverPenalty = longLayoverHours * prefs.longLayoverPenaltyPerHour;

  const redEyePenalty = prefs.penaliseRedEye && metrics.isRedEye ? prefs.redEyePenalty : 0;

  // comfort 0..100 -> roughly −comfortWeight/2 .. +comfortWeight/2 (neutral at 50)
  const comfortValue = ((comfort - 50) / 100) * prefs.comfortWeight;

  const ttv =
    -effectivePrice - timeCost - stopPenalty - layoverPenalty - redEyePenalty + comfortValue;

  const reasons: string[] = [];
  reasons.push(
    metrics.totalStops === 0
      ? "Direct"
      : `${metrics.totalStops} stop${metrics.totalStops > 1 ? "s" : ""}`,
  );
  if (prefs.checkedBagsNeeded > 0) {
    reasons.push(missingBags === 0 ? "Checked bag included" : "No checked bag — est. fee added");
  }
  if (metrics.isRedEye) reasons.push("Overnight / red-eye");
  if (comfort >= 75) reasons.push("High comfort");

  const tags: string[] = [];
  if (metrics.totalStops === 0) tags.push("Direct");

  return {
    offer,
    ttv: round2(ttv),
    comfortScore: comfort,
    metrics,
    breakdown: {
      fare: round2(fare),
      addedBagFee: round2(addedBagFee),
      effectivePrice: round2(effectivePrice),
      timeCost: round2(timeCost),
      stopPenalty: round2(stopPenalty),
      layoverPenalty: round2(layoverPenalty),
      redEyePenalty: round2(redEyePenalty),
      comfortValue: round2(comfortValue),
      ttv: round2(ttv),
    },
    reasons,
    tags,
  };
}
