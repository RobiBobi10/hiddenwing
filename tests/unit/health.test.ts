import { describe, it, expect } from "vitest";
import { getHealth } from "../../src/lib/health";

describe("getHealth", () => {
  it("reports app ok and db not_configured when no DATABASE_URL", () => {
    const h = getHealth(undefined);
    expect(h.app).toBe("ok");
    expect(h.db).toBe("not_configured");
    expect(typeof h.timestamp).toBe("string");
  });

  it("reports db ok when a DATABASE_URL is present", () => {
    const h = getHealth("postgres://example");
    expect(h.db).toBe("ok");
  });
});
