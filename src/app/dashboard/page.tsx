import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/lib/db";

// Protected by src/middleware.ts — unauthenticated visitors never reach here.
export default async function DashboardPage() {
  const user = await currentUser();
  const dbUser = user
    ? await db.user.findUnique({ where: { clerkId: user.id } })
    : null;

  return (
    <main className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="badge">Dashboard · Protected</span>
        <UserButton afterSignOutUrl="/" />
      </div>
      <h1>Hello, {user?.firstName ?? "there"} 👋</h1>
      <p className="lede">
        You&apos;re signed in and this page is protected — only you (and whoever
        else you invite) can see it.
      </p>
      <div className="status">
        <span className="dot" />
        {dbUser
          ? `Synced to the database as ${dbUser.email}.`
          : "Signed in, but not yet synced to the database — check the webhook setup."}
      </div>
      <p style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/search" className="btn" style={{ textDecoration: "none" }}>
          Search flights →
        </Link>
        <Link href="/profile" style={{ alignSelf: "center" }}>
          Your preferences
        </Link>
      </p>
    </main>
  );
}
