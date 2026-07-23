// A small, curated nearby-airport map for common hubs. Deliberately hand-picked
// (no dependency); a full airport dataset is a later upgrade. Used only when the
// user opts into "include nearby airports" flexibility search.

export const NEARBY_AIRPORTS: Record<string, string[]> = {
  // London
  LHR: ["LGW", "STN", "LTN", "LCY"],
  LGW: ["LHR", "STN", "LTN"],
  STN: ["LHR", "LGW", "LTN"],
  LTN: ["LHR", "LGW", "STN"],
  LCY: ["LHR", "LGW"],
  // New York
  JFK: ["EWR", "LGA"],
  EWR: ["JFK", "LGA"],
  LGA: ["JFK", "EWR"],
  // Paris
  CDG: ["ORY", "BVA"],
  ORY: ["CDG", "BVA"],
  // Milan
  MXP: ["LIN", "BGY"],
  LIN: ["MXP", "BGY"],
  // Tokyo
  HND: ["NRT"],
  NRT: ["HND"],
  // Bay Area
  SFO: ["OAK", "SJC"],
  OAK: ["SFO", "SJC"],
  // Washington DC
  IAD: ["DCA", "BWI"],
  DCA: ["IAD", "BWI"],
};

export function nearbyAirports(iata: string): string[] {
  return NEARBY_AIRPORTS[iata] ?? [];
}
