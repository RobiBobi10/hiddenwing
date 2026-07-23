import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ComingSoon from "@/components/coming-soon";

export default async function TripsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <ComingSoon
      badge="Trips"
      title="Your saved trips"
      blurb="Every search you run is already saved. Soon this is where you'll star the trips you like, watch prices, and pull a whole itinerary — flights, stays, and cars — together in one place."
      icon="🧳"
      bullets={[
        "Save & compare trips you're considering",
        "Watch prices and get a nudge when they drop",
        "Your full itinerary in one view",
      ]}
    />
  );
}
