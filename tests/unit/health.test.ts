import { describe, it, expect } from "vitest";
import { getHealth } from "../../src/lib/health";

describe("getHealth", () => {
  it("reports app ok and db not_configured when no DATABASE_URL", async () => {
    const h = await getHealth(undefined);
    expect(h.app).toBe("ok");
    expect(h.db).toBe("not_configured");
    expect(typeof h.timestamp).toBe("string");
  });

  it("reports db ok when a DATABASE_URL is present and the check succeeds", async () => {
    const h = await getHealth("postgres://example", async () => true);
    expect(h.db).toBe("ok");
  });

  it("reports db error when a DATABASE_URL is present but the check fails", async () => {
    const h = await getHealth("postgres://example", async () => {
      throw new Error("connection refused");
    });
    expect(h.db).toBe("error");
  });
});
