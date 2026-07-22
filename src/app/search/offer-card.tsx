import type { NormalizedSlice } from "@/domain/offer/offer";
import type { ScoredOffer } from "@/domain/optimization/ttv";

function fmtTime(iso: string): string {
  if (!iso) return "";
  const t = iso.slice(11, 16); // HH:MM
  return t || iso;
}

function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function stopsLabel(stops: number): string {
  return stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`;
}

function tagClass(tag: string): string {
  if (tag === "Best value") return "tag tag-best";
  if (tag === "Cheapest") return "tag tag-cheap";
  if (tag === "Fastest") return "tag tag-fast";
  return "tag";
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

export default function OfferCard({ scored, currency }: { scored: ScoredOffer; currency: string }) {
  const { offer, tags, reasons, comfortScore } = scored;
  const isBest = tags.includes("Best value");

  return (
    <div className={`card${isBest ? " card-best" : ""}`}>
      {tags.length > 0 && (
        <div className="tags">
          {tags.map((t) => (
            <span key={t} className={tagClass(t)}>
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="offer-main">
        <div>
          {offer.slices.map((slice, i) => (
            <SliceRow key={i} slice={slice} />
          ))}
          <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {offer.owner} · {offer.cabinClass.replace(/_/g, " ")} · comfort {comfortScore}/100
          </div>
          <div className="reasons">{reasons.join(" · ")}</div>
        </div>
        <div className="price">
          {currency} {offer.totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
