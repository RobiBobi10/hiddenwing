// Month price grid: runs one search per day of a month (bounded concurrency),
// records the cheapest fare per day, and caches the result. Duffel has no native
// price-calendar endpoint, so this is DIY fan-out — hence the cap + cache + the
// "this is slow/costly at scale" note in docs (ADR-0007). Fine for a family in
// test mode.

import type { CabinClass, NormalizedQuery } from "@/domain/providers/provider-port";
import { DuffelAdapter } from "./duffel/duffel-adapter";

export interface CalendarResult {
  days: Record<string, number>; // "YYYY-MM-DD" -> cheapest price (rounded)
  cheapest: string | null;
  currency: string;
}

interface CacheEntry extends CalendarResult {
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 15 * 60 * 1000;
const CONCURRENCY = 3;
const BATCH_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function cheapestForDay(
  provider: DuffelAdapter,
  q: NormalizedQuery,
  direct: boolean,
): Promise<{ price: number; currency: string } | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const offers = await provider.search(q);
      const pool = direct ? offers.filter((o) => (o.slices[0]?.stops ?? 1) === 0) : offers;
      if (!pool.length) return null;
      const min = pool.reduce((m, o) => Math.min(m, o.totalAmount), Infinity);
      return { price: Math.round(min), currency: pool[0].currency };
    } catch {
      if (attempt === 0) await sleep(500); // likely rate-limited; back off + retry once
      else return null;
    }
  }
  return null;
}

export interface MonthPriceOptions {
  origin: string;
  destination: string;
  year: number;
  month: number; // 1–12
  adults: number;
  cabinClass: CabinClass;
  direct: boolean;
  today: string; // YYYY-MM-DD
}

export async function monthPrices(opts: MonthPriceOptions): Promise<CalendarResult> {
  const key = `${opts.origin}|${opts.destination}|${opts.year}-${opts.month}|${opts.adults}|${opts.cabinClass}|${opts.direct ? 1 : 0}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) {
    return { days: cached.days, cheapest: cached.cheapest, currency: cached.currency };
  }

  const provider = new DuffelAdapter();
  const daysInMonth = new Date(opts.year, opts.month, 0).getDate();

  const dates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${opts.year}-${String(opts.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (ds >= opts.today) dates.push(ds);
  }

  const days: Record<string, number> = {};
  let currency = "";

  for (let i = 0; i < dates.length; i += CONCURRENCY) {
    const batch = dates.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (ds) => {
        const q: NormalizedQuery = {
          origin: opts.origin,
          destination: opts.destination,
          departureDate: ds,
          returnDate: null,
          passengers: { adults: opts.adults, children: 0, infants: 0 },
          cabinClass: opts.cabinClass,
        };
        return [ds, await cheapestForDay(provider, q, opts.direct)] as const;
      }),
    );
    for (const [ds, r] of results) {
      if (r) {
        days[ds] = r.price;
        if (!currency) currency = r.currency;
      }
    }
    if (i + CONCURRENCY < dates.length) await sleep(BATCH_DELAY_MS);
  }

  let cheapest: string | null = null;
  for (const [ds, p] of Object.entries(days)) {
    if (cheapest === null || p < days[cheapest]) cheapest = ds;
  }

  const result: CalendarResult = { days, cheapest, currency };
  cache.set(key, { ...result, ts: Date.now() });
  return result;
}
