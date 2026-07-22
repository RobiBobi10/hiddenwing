// Server-only Duffel client factory. The token is read from the environment and
// MUST stay server-side — it is never exposed as NEXT_PUBLIC_.

import { Duffel } from "@duffel/api";

let cached: Duffel | null = null;

export function getDuffelClient(): Duffel {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "DUFFEL_ACCESS_TOKEN is not set. Add a Duffel TEST token (duffel_test_…) to .env.local (and to Vercel env vars for deploys).",
    );
  }
  if (!cached) {
    cached = new Duffel({ token });
  }
  return cached;
}
