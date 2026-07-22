// Orchestrates a search: pick provider -> search -> (placeholder) order -> snapshot.
// Real ranking (Total Trip Value + Comfort Score) replaces the cheapest-first
// ordering in Milestone 3 — this is deliberately a stand-in.

import type { NormalizedQuery, ProviderPort } from "@/domain/providers/provider-port";
import type { NormalizedOffer } from "@/domain/offer/offer";
import { DuffelAdapter } from "./duffel/duffel-adapter";
import { saveSearchSnapshot } from "./snapshot-repo";

export interface RunSearchOptions {
  provider?: ProviderPort; // injectable for tests
  userId?: string | null;
  persist?: boolean; // default true
}

export async function runSearch(
  query: NormalizedQuery,
  opts: RunSearchOptions = {},
): Promise<NormalizedOffer[]> {
  const provider = opts.provider ?? new DuffelAdapter();
  const offers = await provider.search(query);

  // Placeholder ordering — cheapest first. NOT the product. Replaced in M3.
  offers.sort((a, b) => a.totalAmount - b.totalAmount);

  if (opts.persist !== false) {
    // Persistence must never break a search — log and continue.
    try {
      await saveSearchSnapshot(query, offers, provider.name, opts.userId ?? null);
    } catch (err) {
      console.error("[search] snapshot persistence failed:", err);
    }
  }

  return offers;
}
