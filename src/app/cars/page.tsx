import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ComingSoon from "@/components/coming-soon";

export default async function CarsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <ComingSoon
      badge="Cars"
      title="Car rentals"
      blurb="Pick up a car at your destination without the usual price games. Hiddenwing will compare rentals on real total cost — including the fees that normally hide until checkout."
      icon="🚗"
      bullets={[
        "True total price, fees included",
        "Matched to your arrival airport & times",
        "Optimized alongside flights and stays",
      ]}
    />
  );
}
