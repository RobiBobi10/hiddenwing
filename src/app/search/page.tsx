import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Brand } from "@/components/brand";
import SearchPanel from "./search-panel";

// Protected by src/middleware.ts; the explicit check is belt-and-braces.
export default async function SearchPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="wrap">
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Brand />
        <UserButton afterSignOutUrl="/" />
      </div>
      <span className="badge" style={{ marginTop: 20 }}>
        Flight search · AI
      </span>
      <h1>Find flights</h1>
      <p className="lede">
        Describe your trip in plain words or use the form. Results are ranked by{" "}
        <strong>Total Trip Value</strong> — price, travel time, stops, comfort, and baggage weighed
        together — and the AI can explain why the top pick is best.
      </p>
      <SearchPanel />
    </main>
  );
}
