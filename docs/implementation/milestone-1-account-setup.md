# Milestone 1 — Connecting Neon + Clerk (step by step)

_Companion to [milestone-1-foundations.md](milestone-1-foundations.md). Do this once — it takes
about 10 minutes and both services are free._

All the code is already written and waiting for these keys. You just need to create two free
accounts and paste four values into `.env.local`.

---

## 1. Database — Neon (free Postgres) ✅ if you already created a project

If you've already signed up at neon.tech and created a project (e.g. named "Hiddenwing"), you're
past steps 1–2 — skip to step 3.

1. Go to **[neon.tech](https://neon.tech)** and sign up (free, no credit card).
2. Create a new project.
3. On the project page, click the **"Connect"** button (top right) — this opens a panel with your
   connection string. Click **"Show password"**, then copy the full string. It looks like:
   ```
   postgresql://neondb_owner:REAL_PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Paste it into `.env.local` as:
   ```
   DATABASE_URL=postgresql://neondb_owner:REAL_PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

> Ignore the **"Neon init" / `npx neonctl@latest init`** and **"AI-guided setup"** options on the
> Neon welcome screen — those scaffold a brand-new project's config from scratch. We already have
> the code; you only need the connection string.

## 2. Auth — Clerk (free up to 50,000 users)

1. Go to **[clerk.com](https://clerk.com)** and sign up, then create an application.
2. **You'll land on a page titled "Add authentication to your app" offering a CLI-driven
   setup — skip it.** That flow (`clerk init`, the "Agent setup" prompt with `command -v clerk`
   etc.) scaffolds its own Clerk integration files from scratch, which would conflict with the
   code already written in this repo. Ignore the whole panel.
3. Instead, find **"API Keys"** in the left sidebar of the Clerk dashboard (key icon), or jump
   straight there: [dashboard.clerk.com/last-active?path=api-keys](https://dashboard.clerk.com/last-active?path=api-keys).
4. Copy the two values shown into `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
5. **Webhook (so sign-ups reach the database):**
   - This step needs your app reachable on the internet, so do it **after** your first deploy to
     Vercel (see the main [README](../../README.md)) — or skip it for now and come back once
     you've deployed. Locally, without this, sign-in still works; only the database sync won't
     happen yet.
   - In Clerk → **Webhooks** → **Add Endpoint**, set the URL to:
     ```
     https://<your-vercel-app>.vercel.app/api/webhooks/clerk
     ```
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`.
   - Copy the **Signing Secret** into `.env.local` (and into Vercel's environment variables):
     ```
     CLERK_WEBHOOK_SECRET=whsec_...
     ```

## 3. Apply the database migration

Once `DATABASE_URL` is set, run:

```bash
npm install          # picks up the new Prisma/Clerk packages
npm run db:migrate    # creates the User table in your Neon database
```

It'll ask for a migration name — type something like `init` and press enter.

## 4. Run it

```bash
npm run dev
```

- Visit **http://localhost:3000** — you should now see **"Create an account · Sign in"** links.
- Click **Create an account**, sign up with an email.
- You should land on **`/dashboard`** — a protected page only signed-in users can see.
- Visit **http://localhost:3000/api/health** — `db` should now say **`"ok"`** (it's actually
  querying your Neon database).

If the dashboard says "signed in, but not yet synced to the database" — that's expected until you
finish the webhook step above (step 2.5), which requires a deployment. Everything else works
without it.

## 5. Deploy (so the webhook can reach you)

If you haven't already, connect this repo to **[vercel.com](https://vercel.com)** (free):
1. Import the GitHub repo in Vercel.
2. Add the same environment variables from `.env.local` in Vercel's Project Settings → Environment
   Variables.
3. Deploy. Then go back and finish step 2.4 (webhook) using your live Vercel URL.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `/api/health` shows `"db": "error"` | `DATABASE_URL` is wrong, or you haven't run `npm run db:migrate` yet |
| Sign-up works but dashboard shows "not yet synced" | Webhook not configured yet, or `CLERK_WEBHOOK_SECRET` is wrong — fine to leave for later |
| `npm run dev` errors about missing Clerk keys | Double-check `.env.local` has both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`, then restart `npm run dev` (env changes need a restart) |

---
Once your dashboard shows "Synced to the database as you@email.com", every checkbox in
[Milestone 1's Definition of Done](milestone-1-foundations.md#6-completion-criteria-definition-of-done)
is satisfied.
