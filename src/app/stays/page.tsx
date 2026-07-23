import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ComingSoon from "@/components/coming-soon";

export default async function StaysPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <ComingSoon
      badge="Stays"
      title="Hotels & stays"
      blurb="One day, Hiddenwing will optimize the whole trip — not just the flight. Stays will be ranked on the same Total Trip Value idea: price, location, comfort, and how well they fit your plans."
      icon="🏨"
      bullets={[
        "Ranked by value, not just star rating",
        "Priced together with your flights",
        "Your preferences applied here too",
      ]}
    />
  );
}
