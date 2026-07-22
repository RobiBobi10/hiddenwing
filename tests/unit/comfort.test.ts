import { describe, it, expect } from "vitest";
import type { NormalizedOffer } from "@/domain/offer/offer";
import { deriveMetrics } from "@/domain/optimization/metrics";
import { comfortScore } from "@/domain/optimization/comfort";

function offer(over: Partial<NormalizedOffer> = {}): NormalizedOffer {
  return {
    id: "o",
    provider: "duffel",
    totalAmount: 400,
    currency: "EUR",
    owner: "Test Air",
    ownerCode: "TA",
    cabinClass: "economy",
    baggage: { checkedBags: 1, carryOnBags: 1 },
    expiresAt: null,
    fetchedAt: "2026-07-22T00:00:00Z",
    slices: [
      {
        origin: "LHR",
        destination: "JFK",
        durationMinutes: 480,
        stops: 0,
        segments: [
          {
            origin: "LHR",
            destination: "JFK",
            departingAt: "2026-08-01T09:00:00",
            arrivingAt: "2026-08-01T17:00:00",
            durationMinutes: 480,
            marketingCarrier: "Test Air",
            marketingCarrierCode: "TA",
          },
        ],
      },
    ],
    ...over,
  };
}

const score = (o: NormalizedOffer) => comfortScore(o, deriveMetrics(o));

describe("comfortScore", () => {
  it("business beats economy", () => {
    expect(score(offer({ cabinClass: "business" }))).toBeGreaterThan(score(offer()));
  });

  it("a 1-stop itinerary scores lower than a direct one", () => {
    const oneStop = offer({
      slices: [
        {
          origin: "LHR",
          destination: "JFK",
          durationMinutes: 640,
          stops: 1,
          segments: [
            {
              origin: "LHR",
              destination: "CDG",
              departingAt: "2026-08-01T09:00:00",
              arrivingAt: "2026-08-01T10:00:00",
              durationMinutes: 60,
              marketingCarrier: "Test Air",
              marketingCarrierCode: "TA",
            },
            {
              origin: "CDG",
              destination: "JFK",
              departingAt: "2026-08-01T12:00:00",
              arrivingAt: "2026-08-01T18:40:00",
              durationMinutes: 400,
              marketingCarrier: "Test Air",
              marketingCarrierCode: "TA",
            },
          ],
        },
      ],
    });
    expect(score(oneStop)).toBeLessThan(score(offer()));
  });

  it("a red-eye scores lower", () => {
    const redEye = offer({
      slices: [
        {
          origin: "LHR",
          destination: "JFK",
          durationMinutes: 480,
          stops: 0,
          segments: [
            {
              origin: "LHR",
              destination: "JFK",
              departingAt: "2026-08-01T23:30:00",
              arrivingAt: "2026-08-02T03:00:00",
              durationMinutes: 480,
              marketingCarrier: "Test Air",
              marketingCarrierCode: "TA",
            },
          ],
        },
      ],
    });
    expect(score(redEye)).toBeLessThan(score(offer()));
  });

  it("is clamped to 0..100", () => {
    const s = score(offer({ cabinClass: "first" }));
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
});
