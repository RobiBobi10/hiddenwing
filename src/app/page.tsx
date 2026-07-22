import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="wrap">
      <span className="badge">Family Edition · Milestone 1</span>
      <h1>Hiddenwing</h1>
      <p className="lede">
        Find the <strong>best trip for you</strong> — not just the cheapest flight.
        This is the foundation running locally on your machine. Flight search, the
        optimization engine, and the AI arrive in the next milestones.
      </p>

      <p style={{ marginBottom: 32 }}>
        {user ? (
          <Link href="/dashboard">Go to your dashboard →</Link>
        ) : (
          <>
            <Link href="/sign-up">Create an account</Link>
            {" · "}
            <Link href="/sign-in">Sign in</Link>
          </>
        )}
      </p>

      <div className="grid">
        <div className="card">
          <h3>✅ It runs locally</h3>
          <p>
            You&apos;re looking at the Next.js app served from <code>localhost:3000</code>.
            Every change you save reloads instantly.
          </p>
        </div>
        <div className="card">
          <h3>🩺 Health check</h3>
          <p>
            Visit <code>/api/health</code> to see the app&apos;s status endpoint —
            it&apos;ll report the database once we connect it.
          </p>
        </div>
        <div className="card">
          <h3>🔒 Auth next</h3>
          <p>
            Sign-in and a protected dashboard get wired up once you add your free
            Clerk keys to <code>.env.local</code>.
          </p>
        </div>
        <div className="card">
          <h3>🗄️ Database next</h3>
          <p>
            A free Neon Postgres connection stores your family&apos;s preferences and
            saved trips — added next in Milestone 1.
          </p>
        </div>
      </div>

      <div className="status">
        <span className="dot" />
        Skeleton is live. Next: connect Neon (database) and Clerk (sign-in).
      </div>

      <p className="foot">
        Hiddenwing · Family Edition · built one milestone at a time. See{" "}
        <code>docs/implementation/milestone-1-foundations.md</code>.
      </p>
    </main>
  );
}
