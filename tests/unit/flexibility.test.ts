import { describe, it, expect } from "vitest";
import type { NormalizedQuery } from "@/domain/providers/provider-port";
import { expandFlexibility } from "@/domain/search/flexibility";

const base: NormalizedQuery = {
  origin: "LHR",
  destination: "JFK",
  departureDate: "2026-09-10",
  returnDate: "2026-09-20",
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: "economy",
};

describe("expandFlexibility", () => {
  it("returns just the base when no flexibility", () => {
    const v = expandFlexibility(base, { dayRange: 0, nearbyOrigins: [], nearbyDests: [], maxVariants: 9 });
    expect(v).toHaveLength(1);
    expect(v[0].query.origin).toBe("LHR");
    expect(v[0].offsetDays).toBe(0);
    expect(v[0].originChanged).toBe(false);
  });

  it("puts the exact base query first", () => {
    const v = expandFlexibility(base, {
      dayRange: 2,
      nearbyOrigins: ["LGW"],
      nearbyDests: ["EWR"],
      maxVariants: 20,
    });
    expect(v[0].query.origin).toBe("LHR");
    expect(v[0].query.destination).toBe("JFK");
    expect(v[0].query.departureDate).toBe("2026-09-10");
  });

  it("expands dates by the same offset on both legs", () => {
    const v = expandFlexibility(base, { dayRange: 1, nearbyOrigins: [], nearbyDests: [], maxVariants: 9 });
    // offsets 0,-1,1 for LHR-JFK only
    const minus1 = v.find((x) => x.offsetDays === -1);
    expect(minus1?.query.departureDate).toBe("2026-09-09");
    expect(minus1?.query.returnDate).toBe("2026-09-19");
  });

  it("includes nearby airports and flags the change", () => {
    const v = expandFlexibility(base, {
      dayRange: 0,
      nearbyOrigins: ["LGW"],
      nearbyDests: ["EWR"],
      maxVariants: 9,
    });
    expect(v.some((x) => x.query.origin === "LGW")).toBe(true);
    expect(v.some((x) => x.query.destination === "EWR")).toBe(true);
    expect(v.find((x) => x.query.origin === "LGW")?.originChanged).toBe(true);
  });

  it("is hard-capped at maxVariants", () => {
    const v = expandFlexibility(base, {
      dayRange: 3,
      nearbyOrigins: ["LGW", "STN"],
      nearbyDests: ["EWR", "LGA"],
      maxVariants: 8,
    });
    expect(v.length).toBe(8);
  });

  it("drops past-date variants when today is given", () => {
    const v = expandFlexibility(base, {
      dayRange: 3,
      nearbyOrigins: [],
      nearbyDests: [],
      maxVariants: 20,
      today: "2026-09-10",
    });
    // no departure before 2026-09-10
    expect(v.every((x) => x.query.departureDate >= "2026-09-10")).toBe(true);
  });

  it("never produces origin === destination", () => {
    const v = expandFlexibility(base, {
      dayRange: 1,
      nearbyOrigins: ["JFK"], // pathological: nearby origin equals destination
      nearbyDests: [],
      maxVariants: 20,
    });
    expect(v.every((x) => x.query.origin !== x.query.destination)).toBe(true);
  });
});
