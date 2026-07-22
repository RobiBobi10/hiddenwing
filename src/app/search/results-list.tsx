import type { ScoredOffer } from "@/domain/optimization/ttv";
import type { Anchors } from "@/domain/optimization/rank";
import OfferCard from "./offer-card";

export interface SearchResults {
  scored: ScoredOffer[];
  anchors: Anchors;
  currency: string;
}

export default function ResultsList({ results }: { results: SearchResults }) {
  const { scored, anchors, currency } = results;

  if (scored.length === 0) {
    return (
      <div className="status">
        No flights found for this search. Try different dates or airports.
      </div>
    );
  }

  const best = scored.find((s) => s.offer.id === anchors.bestValueId);
  const cheapest = scored.find((s) => s.offer.id === anchors.cheapestId);
  const delta =
    best && cheapest ? Math.round((best.offer.totalAmount - cheapest.offer.totalAmount) * 100) / 100 : 0;

  let summary = "";
  if (best && cheapest) {
    if (best.offer.id === cheapest.offer.id) {
      summary = "The best-value pick is also the cheapest.";
    } else if (delta > 0) {
      summary = `Best value costs ${currency} ${delta.toFixed(2)} more than the cheapest — ${best.reasons.join(", ").toLowerCase()}.`;
    } else {
      summary = `Best value: ${best.reasons.join(", ").toLowerCase()}.`;
    }
  }

  return (
    <div>
      <p className="lede" style={{ marginBottom: 8, marginTop: 24 }}>
        {scored.length} option{scored.length === 1 ? "" : "s"} · <strong>best value first</strong>
      </p>
      {summary && (
        <p className="muted" style={{ marginTop: 0, marginBottom: 16, fontSize: 14 }}>
          {summary} <span style={{ opacity: 0.7 }}>Prices indicative, not a booking guarantee.</span>
        </p>
      )}
      <div style={{ display: "grid", gap: 12 }}>
        {scored.map((s) => (
          <OfferCard key={s.offer.id} scored={s} currency={currency} />
        ))}
      </div>
    </div>
  );
}
