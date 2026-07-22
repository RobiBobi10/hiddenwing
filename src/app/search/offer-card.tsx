import type { NormalizedOffer, NormalizedSlice } from "@/domain/offer/offer";

function fmtTime(iso: string): string {
  if (!iso) return "";
  const t = iso.slice(11, 16); // HH:MM from an ISO datetime
  return t || iso;
}

function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function stopsLabel(stops: number): string {
  if (stops === 0) return "Direct";
  return `${stops} stop${stops > 1 ? "s" : ""}`;
}

function SliceRow({ slice }: { slice: NormalizedSlice }) {
  const first = slice.segments[0];
  const last = slice.segments[slice.segments.length - 1];
  return (
    <div className="offer-slice">
      <strong>
        {fmtTime(first?.departingAt ?? "")} → {fmtTime(last?.arrivingAt ?? "")}
      </strong>{" "}
      <span className="muted">
        {slice.origin} → {slice.destination} · {fmtDuration(slice.durationMinutes)} ·{" "}
        {stopsLabel(slice.stops)}
      </span>
    </div>
  );
}

export default function OfferCard({ offer }: { offer: NormalizedOffer }) {
  return (
    <div className="card">
      <div className="offer-main">
        <div>
          {offer.slices.map((slice, i) => (
            <SliceRow key={i} slice={slice} />
          ))}
          <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {offer.owner} · {offer.cabinClass.replace(/_/g, " ")} · {offer.baggage.checkedBags}{" "}
            checked bag{offer.baggage.checkedBags === 1 ? "" : "s"}
          </div>
        </div>
        <div className="price">
          {offer.currency} {offer.totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
