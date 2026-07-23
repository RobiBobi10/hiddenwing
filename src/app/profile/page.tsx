import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <main className="wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="badge">Your preferences · Milestone 5</span>
        <UserButton afterSignOutUrl="/" />
      </div>
      <h1>Your travel preferences</h1>
      <p className="lede">
        These tune how <strong>your</strong> results are ranked — everyone in the family can have
        their own. Higher weights matter more; hard limits remove options entirely.
      </p>
      <ProfileForm />
      <p style={{ marginTop: 28 }}>
        <Link href="/search">← Back to search</Link>
      </p>
    </main>
  );
}
