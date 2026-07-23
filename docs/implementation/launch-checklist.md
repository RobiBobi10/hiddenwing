# Launch Checklist — Family Edition go-live

_Status: Active · Owner: You · Part of [Milestone 6](milestone-6-polish-price-integrity-launch.md)_

A short, practical pass before you hand Hiddenwing to the family. This is the **Family Edition**
launch — private, no payments — so it's a QA + safety pass, not a compliance program (see
[before you go public](before-you-go-public.md) for that boundary).

## 1. Functionality (test on desktop **and** phone)
- [ ] Sign up / sign in / sign out work.
- [ ] `/dashboard` shows synced status; links to Search and Your preferences.
- [ ] **AI search**: a plain-language trip returns an "I understood…" line + ranked results.
- [ ] **Manual search**: form returns ranked results.
- [ ] **Flexibility**: ± days / nearby airports searches multiple combinations (slower, capped).
- [ ] **Profile**: editing weights / "never red-eye" changes the ranking; hidden count shows.
- [ ] **Why this pick?**: returns a grounded explanation (real numbers only).
- [ ] **Confirm price**: re-validates; a fresh offer confirms, an expired one says "re-search".
- [ ] Airline logos + city/airport names render; dates show on each option.

## 2. Health & data
- [ ] `GET /api/health` returns `{ app: ok, db: ok }`.
- [ ] A search creates a `Search` + `Offer` snapshot in the database.
- [ ] Neon, Clerk, Duffel (test token), Gemini keys all present in **Vercel** env vars.

## 3. Safety & cost
- [ ] Clerk **allowlist / invite-only** is ON (no public sign-ups) — see [onboarding](family-onboarding.md).
- [ ] Rate limiting active on search / AI / price routes (a runaway loop is capped).
- [ ] Security headers present (check response headers on the live site).
- [ ] All secrets are server-side only; `.env*` is git-ignored; nothing sensitive committed.
- [ ] Duffel is still in **test mode** (no real bookings/charges) unless you deliberately went live.
- [ ] `npm audit` reviewed; safe fixes applied (no `--force`).

## 4. Quality gate
- [ ] `npm run test` green.
- [ ] `npm run build` succeeds; typecheck clean.
- [ ] Latest `main` deployed on Vercel; a real search works on the live URL.

## 5. Ship
- [ ] Send the family the link + the first-run guide from [onboarding](family-onboarding.md).
- [ ] Plan one real trip with it, note what's annoying, and feed it into the
      [future roadmap](../product/19-future-roadmap.md).

When these are checked, the **Family Edition MVP is launched.** 🎉
