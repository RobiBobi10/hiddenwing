// PURE: derive the measurable trip metrics the scorer needs from a NormalizedOffer.
// No I/O, no preferences — just facts about the itinerary.

import type { NormalizedOffer } from "@/domain/offer/offer";

export interface OfferMetrics {
  totalDurationMinutes: number; // summed across slices (both legs of a return)
  totalStops: number; // summed across slices
  totalLayoverMinutes: number; // summed gaps between consecutive segments
  isRedEye: boolean; // departs 22:00–05:00 or arrives 00:00–05:00 on any leg
  checkedBags: number; // from the offer's normalized baggage
}

function hourOf(iso: string): number | null {
  if (!iso || iso.length < 13) return null;
  const h = Number(iso.slice(11, 13));
  return Number.isFinite(h) ? h : null;
}

function minutesBetween(aIso: string, bIso: string): number {
  const a = Date.parse(aIso);
  const b = Date.parse(bIso);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}

export function deriveMetrics(offer: NormalizedOffer): OfferMetrics {
  let totalDurationMinutes = 0;
  let totalStops = 0;
  let totalLayoverMinutes = 0;
  let isRedEye = false;

  for (const slice of offer.slices) {
    totalDurationMinutes += slice.durationMinutes;
    totalStops += slice.stops;

    for (let i = 1; i < slice.segments.length; i++) {
      totalLayoverMinutes += minutesBetween(
        slice.segments[i - 1].arrivingAt,
        slice.segments[i].departingAt,
      );
    }

    const depH = hourOf(slice.segments[0]?.departingAt ?? "");
    const arrH = hourOf(slice.segments[slice.segments.length - 1]?.arrivingAt ?? "");
    if (depH !== null && (depH >= 22 || depH < 5)) isRedEye = true;
    if (arrH !== null && arrH < 5) isRedEye = true;
  }

  return {
    totalDurationMinutes,
    totalStops,
    totalLayoverMinutes,
    isRedEye,
    checkedBags: offer.baggage.checkedBags,
  };
}
