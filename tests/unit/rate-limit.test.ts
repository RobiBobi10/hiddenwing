import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit then blocks within a window", () => {
    const key = `k-${Math.random()}`;
    const t = 1_000_000;
    expect(rateLimit(key, 3, 60_000, t).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000, t).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000, t).ok).toBe(true);
    const blocked = rateLimit(key, 3, 60_000, t);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const key = `k-${Math.random()}`;
    const t = 2_000_000;
    rateLimit(key, 1, 60_000, t);
    expect(rateLimit(key, 1, 60_000, t).ok).toBe(false);
    expect(rateLimit(key, 1, 60_000, t + 60_001).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const t = 3_000_000;
    expect(rateLimit(`a-${t}`, 1, 60_000, t).ok).toBe(true);
    expect(rateLimit(`b-${t}`, 1, 60_000, t).ok).toBe(true);
  });
});
