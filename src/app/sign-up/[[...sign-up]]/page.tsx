import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="wrap" style={{ display: "flex", justifyContent: "center" }}>
      <SignUp />
    </main>
  );
}
