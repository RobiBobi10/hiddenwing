// The provider-agnostic contract for the AI layer. The app depends on THIS, never
// on Gemini/Claude directly, so the model is swappable in one file (ADR-0002 pattern).
//
// The AI does exactly two edge tasks — understand and explain. It NEVER ranks, prices,
// or chooses flights; deterministic code owns that (ADR-0006).

import type { NormalizedQuery, CabinClass } from "@/domain/providers/provider-port";
import type { TtvBreakdown } from "@/domain/optimization/ttv";

/** Structured trip params extracted from free text. Still passes through validation. */
export interface ParsedTripRequest {
  origin: string; // IATA (may be empty if the AI couldn't extract one)
  destination: string;
  departureDate: string; // YYYY-MM-DD (may be empty)
  returnDate: string | null;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  interpretation: string; // short human-readable summary of what was understood
}

/** Everything the explainer needs — all already computed by the deterministic engine. */
export interface ExplainInput {
  query: NormalizedQuery;
  currency: string;
  best: {
    owner: string;
    price: number;
    stops: number;
    durationMinutes: number;
    comfortScore: number;
    reasons: string[];
    breakdown: TtvBreakdown;
  };
  cheapestPrice: number | null;
}

export interface AiPort {
  readonly name: string;
  /** Parse free text into structured params. `today` (YYYY-MM-DD) anchors relative dates. */
  parseTripRequest(text: string, today: string): Promise<ParsedTripRequest>;
  /** A grounded 2–3 sentence explanation using ONLY the supplied numbers. */
  explain(input: ExplainInput): Promise<string>;
}
