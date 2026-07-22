import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="wrap" style={{ display: "flex", justifyContent: "center" }}>
      <SignIn />
    </main>
  );
}
