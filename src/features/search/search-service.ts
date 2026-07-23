// Orchestrates a search: (optional) bounded flexibility fan-out -> hard-constraint
// filter (M5) -> TTV ranking with the user's weights (M3/M5) -> snapshot.

import type { NormalizedOffer } from "@/domain/offer/offer";
import type { NormalizedQuery, ProviderPort } from "@/domain/providers/provider-port";
import type { Preferences } from "@/domain/optimization/preferences";
import { DEFAULT_PREFERENCES } from "@/domain/optimization/preferences";
import type { HardConstraints } from "@/domain/optimization/constraints";
import { DEFAULT_CONSTRAINTS, applyHardConstraints } from "@/domain/optimization/constraints";
import { rankOffers, type RankResult } from "@/domain/optimization/rank";
import { expandFlexibility } from "@/domain/search/flexibility";
import { DuffelAdapter } from "./duffel/duffel-adapter";
import { nearbyAirports } from "./nearby-airports";
import { saveSearchSnapshot } from "./snapshot-repo";

export interface FlexibilityInput {
  dayRange: number; // ± days (0–3)
  includeNearby: boolean;
  today?: string;
}

export interface RunSearchOptions {
  provider?: ProviderPort;
  userId?: string | null;
  persist?: boolean;
  preferences?: Preferences;
  constraints?: HardConstraints;
  flexibility?: FlexibilityInput;
  maxVariants?: number; // hard cap on flexibility fan-out (default 8)
}

export interface SearchResult extends RankResult {
  currency: string;
  count: number;
  removedByConstraints: number;
  variantsSearched: number;
}

export async function runSearch(
  query: NormalizedQuery,
  opts: RunSearchOptions = {},
): Promise<SearchResult> {
  const provider = opts.provider ?? new DuffelAdapter();
  const flex = opts.flexibility;
  const useFlex = Boolean(flex && (flex.dayRange > 0 || flex.includeNearby));

  let offers: NormalizedOffer[];
  let variantsSearched = 1;

  if (useFlex && flex) {
    const variants = expandFlexibility(query, {
      dayRange: flex.dayRange,
      nearbyOrigins: flex.includeNearby ? nearbyAirports(query.origin).slice(0, 2) : [],
      nearbyDests: flex.includeNearby ? nearbyAirports(query.destination).slice(0, 2) : [],
      maxVariants: opts.maxVariants ?? 8,
      today: flex.today,
    });
    variantsSearched = variants.length;

    const lists = await Promise.all(
      variants.map((v) =>
        provider.search(v.query).catch((err) => {
          console.error("[search] flexibility variant failed:", err);
          return [] as NormalizedOffer[];
        }),
      ),
    );

    // Merge + de-duplicate by provider offer id.
    const byId = new Map<string, NormalizedOffer>();
    for (const list of lists) {
      for (const o of list) if (!byId.has(o.id)) byId.set(o.id, o);
    }
    offers = [...byId.values()];
  } else {
    offers = await provider.search(query);
  }

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
    variantsSearched,
  };
}
