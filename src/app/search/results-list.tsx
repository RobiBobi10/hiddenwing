import type { NormalizedOffer } from "@/domain/offer/offer";
import OfferCard from "./offer-card";

export default function ResultsList({ offers }: { offers: NormalizedOffer[] }) {
  if (offers.length === 0) {
    return (
      <div className="status">
        No flights found for this search. Try different dates or airports.
      </div>
    );
  }

  return (
    <div>
      <p className="lede" style={{ marginBottom: 16, marginTop: 24 }}>
        {offers.length} option{offers.length === 1 ? "" : "s"} · cheapest first ·{" "}
        <span className="muted">indicative prices, not a booking guarantee</span>
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {offers.map((o) => (
          <OfferCard key={o.id} offer={o} />
        ))}
      </div>
    </div>
  );
}
