import { describe, it, expect } from "vitest";
import type { NormalizedOffer } from "@/domain/offer/offer";
import { applyHardConstraints } from "@/domain/optimization/constraints";

let seq = 0;
function offer(opts: { redEye?: boolean; stops?: number } = {}): NormalizedOffer {
  seq += 1;
  const dep = opts.redEye ? "2026-08-01T23:30:00" : "2026-08-01T09:00:00";
  const segments = [];
  const legs = (opts.stops ?? 0) + 1;
  for (let i = 0; i < legs; i++) {
    segments.push({
      origin: "AAA",
      destination: "BBB",
      departingAt: i === 0 ? dep : "2026-08-01T14:00:00",
      arrivingAt: opts.redEye && i === legs - 1 ? "2026-08-02T03:00:00" : "2026-08-01T17:00:00",
      durationMinutes: 300,
      marketingCarrier: "Test",
      marketingCarrierCode: "TT",
    });
  }
  return {
    id: `o${seq}`,
    provider: "duffel",
    totalAmount: 400,
    currency: "EUR",
    owner: "Test",
    ownerCode: "TT",
    cabinClass: "economy",
    baggage: { checkedBags: 1, carryOnBags: 1 },
    expiresAt: null,
    fetchedAt: "2026-07-23T00:00:00Z",
    slices: [{ origin: "AAA", destination: "BBB", durationMinutes: 300 * legs, stops: opts.stops ?? 0, segments }],
  };
}

describe("applyHardConstraints", () => {
  it("keeps everything when no constraints are set", () => {
    const offers = [offer(), offer({ redEye: true }), offer({ stops: 2 })];
    const r = applyHardConstraints(offers, { noRedEye: false, maxStops: null });
    expect(r.kept).toHaveLength(3);
    expect(r.removed).toBe(0);
  });

  it("removes red-eyes when noRedEye is set", () => {
    const offers = [offer(), offer({ redEye: true }), offer()];
    const r = applyHardConstraints(offers, { noRedEye: true, maxStops: null });
    expect(r.kept).toHaveLength(2);
    expect(r.removed).toBe(1);
  });

  it("removes offers exceeding maxStops", () => {
    const offers = [offer({ stops: 0 }), offer({ stops: 1 }), offer({ stops: 2 })];
    const r = applyHardConstraints(offers, { noRedEye: false, maxStops: 1 });
    expect(r.kept).toHaveLength(2); // 0 and 1 stop kept, 2-stop removed
    expect(r.removed).toBe(1);
  });

  it("applies both filters together", () => {
    const offers = [offer(), offer({ redEye: true }), offer({ stops: 2 })];
    const r = applyHardConstraints(offers, { noRedEye: true, maxStops: 0 });
    expect(r.kept).toHaveLength(1); // only the plain direct daytime offer
    expect(r.removed).toBe(2);
  });
});
