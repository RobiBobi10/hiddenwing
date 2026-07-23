import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { WingLogo } from "@/components/brand";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="wrap">
      <span className="brand">
        <WingLogo size={30} />
        <span className="brand-name">Hiddenwing</span>
      </span>

      <div>
        <span className="badge">AI travel optimizer</span>
      </div>

      <h1>The best trip for you — not just the cheapest flight.</h1>
      <p className="lede">
        Describe a trip in plain words and Hiddenwing ranks real flights by{" "}
        <strong>Total Trip Value</strong> — price, travel time, stops, comfort, and baggage weighed
        together — learns what <em>you</em> care about, and explains why the top pick is best. A
        private optimizer for you and your family.
      </p>

      <p style={{ marginBottom: 40, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        {user ? (
          <Link href="/search" className="btn" style={{ textDecoration: "none" }}>
            Find flights →
          </Link>
        ) : (
          <>
            <Link href="/sign-up" className="btn" style={{ textDecoration: "none" }}>
              Create an account
            </Link>
            <Link href="/sign-in">Sign in</Link>
          </>
        )}
      </p>

      <div className="grid">
        <div className="card">
          <h3>✈️ Best value, not just cheapest</h3>
          <p>
            A deterministic engine scores every option on price, time, stops, comfort and bags — and
            shows the cheapest, fastest and best-value picks side by side.
          </p>
        </div>
        <div className="card">
          <h3>💬 Just describe your trip</h3>
          <p>
            &ldquo;Cheap flights from London to New York in September for 2 adults&rdquo; — the AI
            turns plain words into a search, no airport codes required.
          </p>
        </div>
        <div className="card">
          <h3>👤 Personal to each traveler</h3>
          <p>
            Everyone gets their own profile — never red-eyes, always a checked bag, hates
            connections — and the ranking adapts to them.
          </p>
        </div>
        <div className="card">
          <h3>🔒 Real prices, checked live</h3>
          <p>
            Before you book, Hiddenwing re-checks the fare is still live and hands you off to book
            directly with the airline. It never guesses a price.
          </p>
        </div>
      </div>

      <div className="status">
        <span className="dot" />
        Your private flight optimizer — sign in to start planning.
      </div>

      <p className="foot">Hiddenwing · built for families, optimized for value.</p>
    </main>
  );
}
