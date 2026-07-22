import { describe, it, expect } from "vitest";
import type { NormalizedOffer } from "@/domain/offer/offer";
import { DEFAULT_PREFERENCES } from "@/domain/optimization/preferences";
import { scoreOffer } from "@/domain/optimization/ttv";
import { rankOffers } from "@/domain/optimization/rank";

let seq = 0;
function directOffer(over: Partial<NormalizedOffer> = {}): NormalizedOffer {
  seq += 1;
  return {
    id: `o${seq}`,
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

const ttv = (o: NormalizedOffer) => scoreOffer(o, DEFAULT_PREFERENCES).ttv;

describe("scoreOffer — trade-offs", () => {
  it("a slightly pricier fare WITH a bag beats a cheaper BAGLESS one", () => {
    const withBag = directOffer({ totalAmount: 430, baggage: { checkedBags: 1, carryOnBags: 1 } });
    const bagless = directOffer({ totalAmount: 400, baggage: { checkedBags: 0, carryOnBags: 1 } });
    // bagless effective price = 400 + 50 est fee = 450 > 430
    expect(ttv(withBag)).toBeGreaterThan(ttv(bagless));
  });

  it("a direct beats a same-price 1-stop", () => {
    const direct = directOffer({ totalAmount: 400 });
    const oneStop = directOffer({
      totalAmount: 400,
      slices: [
        {
          origin: "LHR",
          destination: "JFK",
          durationMinutes: 600,
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
              departingAt: "2026-08-01T11:30:00",
              arrivingAt: "2026-08-01T18:00:00",
              durationMinutes: 390,
              marketingCarrier: "Test Air",
              marketingCarrierCode: "TA",
            },
          ],
        },
      ],
    });
    expect(ttv(direct)).toBeGreaterThan(ttv(oneStop));
  });

  it("the breakdown terms sum to the reported TTV", () => {
    const s = scoreOffer(directOffer({ totalAmount: 400 }), DEFAULT_PREFERENCES);
    const b = s.breakdown;
    const sum =
      -b.effectivePrice - b.timeCost - b.stopPenalty - b.layoverPenalty - b.redEyePenalty + b.comfortValue;
    expect(Math.abs(sum - b.ttv)).toBeLessThan(0.01);
  });
});

describe("rankOffers — anchors + ordering", () => {
  it("tags cheapest, fastest, and best value, and orders best-value first", () => {
    const cheapSlow = directOffer({
      totalAmount: 300,
      slices: [
        {
          origin: "LHR",
          destination: "JFK",
          durationMinutes: 900,
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
              departingAt: "2026-08-01T14:00:00",
              arrivingAt: "2026-08-01T21:00:00",
              durationMinutes: 420,
              marketingCarrier: "Test Air",
              marketingCarrierCode: "TA",
            },
          ],
        },
      ],
    });
    const midDirect = directOffer({ totalAmount: 420, cabinClass: "economy" });
    const fastBiz = directOffer({ totalAmount: 900, cabinClass: "business", slices: [
      {
        origin: "LHR",
        destination: "JFK",
        durationMinutes: 420,
        stops: 0,
        segments: [
          {
            origin: "LHR",
            destination: "JFK",
            departingAt: "2026-08-01T09:00:00",
            arrivingAt: "2026-08-01T16:00:00",
            durationMinutes: 420,
            marketingCarrier: "Test Air",
            marketingCarrierCode: "TA",
          },
        ],
      },
    ] });

    const { scored, anchors } = rankOffers([cheapSlow, midDirect, fastBiz]);

    expect(anchors.cheapestId).toBe(cheapSlow.id); // 300 is lowest fare
    expect(anchors.fastestId).toBe(fastBiz.id); // 420 min duration
    // best value should be the mid direct (cheap enough, direct, bag, decent comfort)
    expect(anchors.bestValueId).toBe(midDirect.id);
    // ordered best-value first
    expect(scored[0].offer.id).toBe(midDirect.id);
    expect(scored[0].tags).toContain("Best value");
  });
});
