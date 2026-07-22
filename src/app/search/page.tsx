import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import SearchForm from "./search-form";

// Protected by src/middleware.ts; the explicit check is belt-and-braces.
export default async function SearchPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="wrap">
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span className="badge">Flight search · Milestone 2</span>
        <UserButton afterSignOutUrl="/" />
      </div>
      <h1>Find flights</h1>
      <p className="lede">
        Real flight options via Duffel (test mode), ranked by <strong>Total Trip Value</strong> —
        price, travel time, stops, comfort, and baggage weighed together, not just the lowest fare.
      </p>
      <SearchForm />
    </main>
  );
}
