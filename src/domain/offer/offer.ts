// Common offer model — provider-AGNOSTIC.
// Every provider adapter normalizes into these shapes; the rest of the app
// (ranking in M3, UI, snapshots) only ever sees these, never Duffel/Amadeus/etc.
// This is the seam that makes a second provider additive (ADR-0002).

export interface NormalizedSegment {
  origin: string; // IATA code
  destination: string; // IATA code
  originName?: string; // human-readable city/airport (M6)
  destinationName?: string;
  departingAt: string; // ISO datetime as the provider reports it (local to origin)
  arrivingAt: string; // ISO datetime
  durationMinutes: number;
  marketingCarrier: string; // airline name
  marketingCarrierCode: string; // IATA airline code
  flightNumber?: string;
}

export interface NormalizedSlice {
  origin: string; // IATA
  destination: string; // IATA
  originName?: string; // human-readable city/airport (M6)
  destinationName?: string;
  durationMinutes: number;
  stops: number; // segments - 1
  segments: NormalizedSegment[];
}

export interface NormalizedBaggage {
  checkedBags: number; // best-effort "included per adult" (indicative in M2)
  carryOnBags: number;
}

export interface NormalizedOffer {
  id: string; // provider's offer id
  provider: string; // e.g. "duffel"
  totalAmount: number; // numeric total
  currency: string; // ISO currency code
  owner: string; // operating/marketing airline name
  ownerCode: string; // IATA airline code
  ownerLogoUrl?: string | null; // small airline logo, if provided (M6)
  cabinClass: string; // economy | premium_economy | business | first
  slices: NormalizedSlice[]; // 1 slice = one-way, 2 = return
  baggage: NormalizedBaggage;
  expiresAt: string | null; // provider offer expiry — do NOT book past this without re-validation
  fetchedAt: string; // when WE fetched it (ISO)
}
