/**
 * Pure health-check logic, kept separate from the HTTP route so it is easy to
 * unit-test (see tests/unit/health.test.ts). `checkDb` is injected so unit
 * tests never need a real database connection; the route wires up the real
 * Prisma check (see src/app/api/health/route.ts).
 */

export type HealthStatus = {
  app: "ok";
  db: "ok" | "not_configured" | "error";
  timestamp: string;
};

export async function getHealth(
  databaseUrl: string | undefined,
  checkDb?: () => Promise<boolean>
): Promise<HealthStatus> {
  let db: HealthStatus["db"] = "not_configured";

  if (databaseUrl) {
    if (checkDb) {
      db = (await checkDb().catch(() => false)) ? "ok" : "error";
    } else {
      db = "ok";
    }
  }

  return {
    app: "ok",
    db,
    timestamp: new Date().toISOString(),
  };
}
