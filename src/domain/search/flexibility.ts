// PURE: expand a base query into a BOUNDED set of date × airport variants for
// flexibility search. The caller resolves nearby airports and passes them in, so
// this stays dependency-free. Hard-capped at maxVariants to protect provider
// call volume and latency (ADR-0007 / doc 12 §3).

import type { NormalizedQuery } from "@/domain/providers/provider-port";

export interface FlexibilityOptions {
  dayRange: number; // ± days (0–3)
  nearbyOrigins: string[]; // already-resolved alternate origins
  nearbyDests: string[]; // already-resolved alternate destinations
  maxVariants: number; // hard cap on total variants
  today?: string; // YYYY-MM-DD; if set, drop variants whose departure is in the past
}

export interface QueryVariant {
  query: NormalizedQuery;
  offsetDays: number;
  originChanged: boolean;
  destChanged: boolean;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Offsets ordered by nearness: 0, -1, +1, -2, +2, -3, +3 (truncated to range). */
function offsetList(range: number): number[] {
  const r = Math.max(0, Math.min(3, range));
  const out = [0];
  for (let i = 1; i <= r; i++) {
    out.push(-i, i);
  }
  return out;
}

export function expandFlexibility(base: NormalizedQuery, o: FlexibilityOptions): QueryVariant[] {
  const origins = [base.origin, ...o.nearbyOrigins];
  const dests = [base.destination, ...o.nearbyDests];
  const offsets = offsetList(o.dayRange);

  const variants: QueryVariant[] = [];
  const seen = new Set<string>();

  // offset outer → base-date variants across airports come first, then nearer dates.
  for (const off of offsets) {
    for (const orig of origins) {
      for (const dest of dests) {
        if (orig === dest) continue;
        const departureDate = addDays(base.departureDate, off);
        if (o.today && departureDate < o.today) continue;
        const returnDate = base.returnDate ? addDays(base.returnDate, off) : null;

        const key = `${orig}|${dest}|${departureDate}|${returnDate ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);

        variants.push({
          query: { ...base, origin: orig, destination: dest, departureDate, returnDate },
          offsetDays: off,
          originChanged: orig !== base.origin,
          destChanged: dest !== base.destination,
        });

        if (variants.length >= o.maxVariants) return variants;
      }
    }
  }

  return variants;
}
