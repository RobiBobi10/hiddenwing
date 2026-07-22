import { describe, it, expect } from "vitest";
import {
  mapDuffelOffer,
  parseIsoDurationToMinutes,
  type DuffelOfferInput,
} from "@/features/search/duffel/duffel-mapper";

describe("parseIsoDurationToMinutes", () => {
  it("parses hours and minutes", () => {
    expect(parseIsoDurationToMinutes("PT7H30M")).toBe(450);
  });
  it("parses minutes only", () => {
    expect(parseIsoDurationToMinutes("PT45M")).toBe(45);
  });
  it("parses days + hours", () => {
    expect(parseIsoDurationToMinutes("P1DT2H")).toBe(26 * 60);
  });
  it("returns 0 for empty/undefined", () => {
    expect(parseIsoDurationToMinutes(undefined)).toBe(0);
    expect(parseIsoDurationToMinutes("")).toBe(0);
  });
});

const fixture: DuffelOfferInput = {
  id: "off_123",
  total_amount: "412.50",
  total_currency: "GBP",
  owner: { name: "Duffel Airways", iata_code: "ZZ" },
  expires_at: "2026-08-01T10:00:00Z",
  slices: [
    {
      origin: { iata_code: "LHR" },
      destination: { iata_code: "JFK" },
      duration: "PT8H0M",
      segments: [
        {
          origin: { iata_code: "LHR" },
          destination: { iata_code: "JFK" },
          departing_at: "2026-08-01T09:00:00",
          arriving_at: "2026-08-01T12:00:00",
          duration: "PT8H0M",
          marketing_carrier: { name: "Duffel Airways", iata_code: "ZZ" },
          marketing_carrier_flight_number: "100",
          passengers: [
            {
              cabin_class: "economy",
              baggages: [
                { type: "checked", quantity: 1 },
                { type: "carry_on", quantity: 1 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe("mapDuffelOffer", () => {
  const fetchedAt = "2026-07-22T00:00:00Z";
  const o = mapDuffelOffer(fixture, fetchedAt);

  it("maps price and currency", () => {
    expect(o.totalAmount).toBe(412.5);
    expect(o.currency).toBe("GBP");
  });
  it("maps owner and cabin class", () => {
    expect(o.owner).toBe("Duffel Airways");
    expect(o.ownerCode).toBe("ZZ");
    expect(o.cabinClass).toBe("economy");
  });
  it("computes stops and duration", () => {
    expect(o.slices).toHaveLength(1);
    expect(o.slices[0].stops).toBe(0);
    expect(o.slices[0].durationMinutes).toBe(480);
    expect(o.slices[0].origin).toBe("LHR");
    expect(o.slices[0].destination).toBe("JFK");
  });
  it("extracts baggage", () => {
    expect(o.baggage.checkedBags).toBe(1);
    expect(o.baggage.carryOnBags).toBe(1);
  });
  it("keeps provider identity and fetchedAt", () => {
    expect(o.provider).toBe("duffel");
    expect(o.fetchedAt).toBe(fetchedAt);
    expect(o.expiresAt).toBe("2026-08-01T10:00:00Z");
  });
});

describe("mapDuffelOffer — multi-segment slice", () => {
  it("counts a 2-segment slice as 1 stop", () => {
    const twoLeg: DuffelOfferInput = {
      id: "off_2",
      total_amount: "300.00",
      total_currency: "EUR",
      owner: { name: "Test Air", iata_code: "TA" },
      slices: [
        {
          origin: { iata_code: "AMS" },
          destination: { iata_code: "BCN" },
          duration: "PT5H",
          segments: [
            { origin: { iata_code: "AMS" }, destination: { iata_code: "CDG" } },
            { origin: { iata_code: "CDG" }, destination: { iata_code: "BCN" } },
          ],
        },
      ],
    };
    const o = mapDuffelOffer(twoLeg, "2026-07-22T00:00:00Z");
    expect(o.slices[0].stops).toBe(1);
    expect(o.slices[0].segments).toHaveLength(2);
  });
});
