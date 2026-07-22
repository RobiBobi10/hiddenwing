import { describe, it, expect } from "vitest";
import { buildSearchSchema } from "@/lib/validation/search-schema";

// Fixed "today" so the past-date rule is deterministic.
const schema = buildSearchSchema(new Date("2026-07-22T00:00:00Z"));

const valid = {
  origin: "lhr",
  destination: "jfk",
  departureDate: "2026-08-01",
  returnDate: "",
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: "economy",
};

describe("search schema", () => {
  it("parses and normalizes a valid query", () => {
    const r = schema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.origin).toBe("LHR"); // uppercased + trimmed
      expect(r.data.destination).toBe("JFK");
      expect(r.data.returnDate).toBeNull(); // "" -> null
      expect(r.data.passengers.adults).toBe(1);
      expect(r.data.cabinClass).toBe("economy");
    }
  });

  it("rejects past departure dates", () => {
    expect(schema.safeParse({ ...valid, departureDate: "2020-01-01" }).success).toBe(false);
  });

  it("rejects identical origin and destination", () => {
    expect(schema.safeParse({ ...valid, destination: "lhr" }).success).toBe(false);
  });

  it("rejects non-IATA airport codes", () => {
    expect(schema.safeParse({ ...valid, origin: "London" }).success).toBe(false);
  });

  it("rejects zero adults", () => {
    expect(schema.safeParse({ ...valid, adults: 0 }).success).toBe(false);
  });

  it("rejects a return date before departure", () => {
    expect(schema.safeParse({ ...valid, returnDate: "2026-07-25" }).success).toBe(false);
  });

  it("accepts a valid return trip", () => {
    const r = schema.safeParse({ ...valid, returnDate: "2026-08-10" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.returnDate).toBe("2026-08-10");
  });

  it("rejects more infants than adults", () => {
    expect(schema.safeParse({ ...valid, adults: 1, infants: 2 }).success).toBe(false);
  });
});
