// The provider-agnostic contract every flight-data source implements.
// The app depends on THIS, never on a concrete provider (ADR-0002), so adding
// or swapping a provider is an adapter change only.

import type { NormalizedOffer } from "@/domain/offer/offer";

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

/** A validated, provider-agnostic search request. */
export interface NormalizedQuery {
  origin: string; // IATA
  destination: string; // IATA
  departureDate: string; // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD or null for one-way
  passengers: PassengerCounts;
  cabinClass: CabinClass;
}

/** Result of a live price re-validation (M6). A stored price is never bookable
 * until confirmed here. */
export interface PriceCheck {
  available: boolean; // false = expired / no longer bookable → re-search
  totalAmount?: number;
  currency?: string;
  expiresAt?: string | null; // when this confirmed price stops being valid
  checkedAt: string; // ISO timestamp of this check
}

export interface ProviderPort {
  readonly name: string;
  /** Run a search and return normalized offers. */
  search(query: NormalizedQuery): Promise<NormalizedOffer[]>;
  /** Live re-validation of a single offer before any booking handoff (M6, NFR-12). */
  price(offerId: string): Promise<PriceCheck>;
}
