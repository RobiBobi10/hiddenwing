// The weights that drive Total Trip Value. In M3 there is ONE default "house"
// profile; M5 makes these per-family-member. Every field is documented so tuning
// is evidence-based, and each maps to a visible term in the TTV breakdown.
//
// NOTE (currency): values are expressed in the offer's own currency unit. All
// offers in a single search share a currency (provider-returned), so terms are
// comparable. Cross-currency normalization is a Scale-Edition concern (doc 13).

export interface Preferences {
  /** Value of one hour of travel time. Higher = time matters more vs. money. */
  valueOfTimePerHour: number;
  /** How many checked bags the traveller needs. */
  checkedBagsNeeded: number;
  /** Estimated fee per MISSING checked bag (real ancillary prices aren't in test mode). */
  estimatedBagFee: number;
  /** Hassle cost of each stop/connection. */
  perStopPenalty: number;
  /** Layover hours considered comfortable; only time beyond this is penalised. */
  comfortableLayoverHours: number;
  /** Penalty per layover hour beyond the comfortable threshold. */
  longLayoverPenaltyPerHour: number;
  /** Whether overnight/red-eye trips are penalised. */
  penaliseRedEye: boolean;
  /** Penalty applied when a trip is a red-eye and the above is true. */
  redEyePenalty: number;
  /** Max monetary swing from comfort: score 0..100 maps to roughly ±comfortWeight/2. */
  comfortWeight: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  valueOfTimePerHour: 30,
  checkedBagsNeeded: 1,
  estimatedBagFee: 50,
  perStopPenalty: 40,
  comfortableLayoverHours: 2,
  longLayoverPenaltyPerHour: 12,
  penaliseRedEye: true,
  redEyePenalty: 60,
  comfortWeight: 120,
};
