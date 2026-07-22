// Orchestrates a search: provider fetch -> TTV ranking (M3) -> snapshot.
// The ranking replaces M2's naive cheapest-first sort.

import type { NormalizedQuery, ProviderPort } from "@/domain/providers/provider-port";
import type { Preferences } from "@/domain/optimization/preferences";
import { DEFAULT_PREFERENCES } from "@/domain/optimization/preferences";
import { rankOffers, type RankResult } from "@/domain/optimization/rank";
import { DuffelAdapter } from "./duffel/duffel-adapter";
import { saveSearchSnapshot } from "./snapshot-repo";

export interface RunSearchOptions {
  provider?: ProviderPort; // injectable for tests
  userId?: string | null;
  persist?: boolean; // default true
  preferences?: Preferences; // default house profile (M5 supplies per-user)
}

export interface SearchResult extends RankResult {
  currency: string;
  count: number;
}

export async function runSearch(
  query: NormalizedQuery,
  opts: RunSearchOptions = {},
): Promise<SearchResult> {
  const provider = opts.provider ?? new DuffelAdapter();
  const offers = await provider.search(query);

  const prefs = opts.preferences ?? DEFAULT_PREFERENCES;
  const ranked = rankOffers(offers, prefs);

  if (opts.persist !== false) {
    // Persistence must never break a search — log and continue. Store in ranked order.
    try {
      await saveSearchSnapshot(
        query,
        ranked.scored.map((s) => s.offer),
        provider.name,
        opts.userId ?? null,
      );
    } catch (err) {
      console.error("[search] snapshot persistence failed:", err);
    }
  }

  return { ...ranked, currency: offers[0]?.currency ?? "", count: ranked.scored.length };
}
