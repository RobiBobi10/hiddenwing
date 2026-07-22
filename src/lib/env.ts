/**
 * Central place to read environment variables. In Milestone 1 these are optional
 * so the app boots before you have accounts set up. As we wire the database
 * (Neon) and auth (Clerk), the relevant vars move from optional to required and
 * we add validation here (planned: zod-based validation).
 */

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
} as const;

export function isDatabaseConfigured(): boolean {
  return Boolean(env.databaseUrl);
}
