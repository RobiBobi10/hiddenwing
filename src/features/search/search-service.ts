// Orchestrates a search: provider fetch -> hard-constraint filter (M5) -> TTV
// ranking with the user's weights (M3/M5) -> snapshot.

import type { NormalizedQuery, ProviderPort } from "@/domain/providers/provider-port";
import type { Preferences } from "@/domain/optimization/preferences";
import { DEFAULT_PREFERENCES } from "@/domain/optimization/preferences";
import type { HardConstraints } from "@/domain/optimization/constraints";
import { DEFAULT_CONSTRAINTS, applyHardConstraints } from "@/domain/optimization/constraints";
import { rankOffers, type RankResult } from "@/domain/optimization/rank";
import { DuffelAdapter } from "./duffel/duffel-adapter";
import { saveSearchSnapshot } from "./snapshot-repo";

export interface RunSearchOptions {
  provider?: ProviderPort; // injectable for tests
  userId?: string | null;
  persist?: boolean; // default true
  preferences?: Preferences; // default house profile (M5 supplies per-user)
  constraints?: HardConstraints; // hard filters (M5)
}

export interface SearchResult extends RankResult {
  currency: string;
  count: number;
  removedByConstraints: number;
}

export async function runSearch(
  query: NormalizedQuery,
  opts: RunSearchOptions = {},
): Promise<SearchResult> {
  const provider = opts.provider ?? new DuffelAdapter();
  const offers = await provider.search(query);

  const { kept, removed } = applyHardConstraints(offers, opts.constraints ?? DEFAULT_CONSTRAINTS);

  const prefs = opts.preferences ?? DEFAULT_PREFERENCES;
  const ranked = rankOffers(kept, prefs);

  if (opts.persist !== false) {
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

  return {
    ...ranked,
    currency: offers[0]?.currency ?? "",
    count: ranked.scored.length,
    removedByConstraints: removed,
  };
}
