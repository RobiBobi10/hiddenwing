import { currentUser } from "@clerk/nextjs/server";
import AppHeader from "@/components/app-header";
import Hero from "@/components/hero";
import HomeSearch from "@/components/home-search";

export default async function Home() {
  const user = await currentUser();

  return (
    <>
      <AppHeader />
      <Hero />
      <section className="home">
        <div className="home-inner">
          <HomeSearch authed={Boolean(user)} />
          <p className="foot" style={{ textAlign: "center", borderTop: "none" }}>
            Hiddenwing · the best trip for you, not just the cheapest flight.
          </p>
        </div>
      </section>
    </>
  );
}
