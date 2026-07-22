/**
 * Pure health-check logic, kept separate from the HTTP route so it is easy to
 * unit-test (see tests/unit/health.test.ts). In Milestone 1 the database check
 * is a placeholder; it becomes a real Postgres ping once Prisma/Neon is wired.
 */

export type HealthStatus = {
  app: "ok";
  db: "ok" | "not_configured";
  timestamp: string;
};

export function getHealth(databaseUrl: string | undefined): HealthStatus {
  return {
    app: "ok",
    db: databaseUrl ? "ok" : "not_configured",
    timestamp: new Date().toISOString(),
  };
}
