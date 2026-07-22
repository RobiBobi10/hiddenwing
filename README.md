# FlightAI — Family Edition

Find the **best trip for you**, not just the cheapest flight. A personalized flight-trip optimizer
you can run for your family. This repo is being built one milestone at a time — see
[`docs/implementation/development-roadmap.md`](docs/implementation/development-roadmap.md).

> **Where the full plan lives:** everything in [`docs/`](docs/README.md). Start with
> [`docs/FAMILY-EDITION.md`](docs/FAMILY-EDITION.md).

---

## ▶ Run it locally (see it right now)

You need **Node.js 20+** installed ([nodejs.org](https://nodejs.org)). Then, in this folder:

```bash
npm install        # one-time: download dependencies
npm run dev        # start the app
```

Open **http://localhost:3000** in your browser. You'll see the FlightAI landing page.
Try the status endpoint too: **http://localhost:3000/api/health**

That's the Milestone-1 skeleton running on your machine. Every file you save reloads automatically.

> First `npm install` downloads a lot of packages and takes a couple of minutes — that's normal and
> only happens once.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Run the app locally at http://localhost:3000 |
| `npm run build` | Production build (what deployment runs) |
| `npm run test` | Run the unit tests (Vitest) |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Lint the code |

## Secrets & configuration

Never put API keys, passwords, or database URLs in the code. They go in a **`.env.local`** file
(which is git-ignored). To set yours up:

```bash
cp .env.example .env.local      # then fill in the values
```

`.env.example` documents every variable. For the very first boot you don't need any of them — the
app runs without them. You'll add the **Neon** (database) and **Clerk** (sign-in) values next, as
described in [Milestone 1](docs/implementation/milestone-1-foundations.md).

## Where things are

```
src/app/          Pages and API routes (Next.js App Router)
src/lib/          Small shared helpers (env, health)
src/domain/       (reserved) pure business logic — TTV optimizer lands here later
src/features/     (reserved) feature slices — search, profile, results
tests/            Unit tests
docs/             The full product & architecture blueprint
```

## Status

**Milestone 1 — Foundations** (in progress): runnable skeleton ✅. Next: connect Neon (database)
and Clerk (auth). See the [milestone checklist](docs/implementation/milestone-1-foundations.md).
