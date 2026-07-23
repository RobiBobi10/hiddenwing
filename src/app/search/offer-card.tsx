"use client";

import { useState } from "react";
import type { NormalizedSlice } from "@/domain/offer/offer";
import type { ScoredOffer } from "@/domain/optimization/ttv";

function fmtTime(iso: string): string {
  if (!iso) return "";
  return iso.slice(11, 16) || iso;
}
function fmtDate(iso: string): string {
  if (!iso || iso.length < 10) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function fmtClock(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function fmtDuration(mins: number): string {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
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

interface PriceCheck {
  available: boolean;
  totalAmount?: number;
  currency?: string;
  expiresAt?: string | null;
  checkedAt: string;
}

function Leg({ slice }: { slice: NormalizedSlice }) {
  const first = slice.segments[0];
  const last = slice.segments[slice.segments.length - 1];
  return (
    <div className="leg">
      <span className="leg-date">{fmtDate(first?.departingAt ?? "")}</span>
      <div className="leg-pt">
        <span className="leg-t">{fmtTime(first?.departingAt ?? "")}</span>
        <span className="leg-code">{slice.origin}</span>
      </div>
      <div className="leg-mid">
        <span>{fmtDuration(slice.durationMinutes)}</span>
        <span className="leg-bar" />
        <span className={slice.stops === 0 ? "leg-direct" : ""}>{stopsLabel(slice.stops)}</span>
      </div>
      <div className="leg-pt">
        <span className="leg-t">{fmtTime(last?.arrivingAt ?? "")}</span>
        <span className="leg-code">{slice.destination}</span>
      </div>
    </div>
  );
}

export default function OfferCard({ scored, currency }: { scored: ScoredOffer; currency: string }) {
  const { offer, tags, reasons, comfortScore } = scored;
  const isBest = tags.includes("Best value");
  const [check, setCheck] = useState<PriceCheck | null>(null);
  const [checking, setChecking] = useState(false);

  async function confirmPrice() {
    setChecking(true);
    setCheck(null);
    try {
      const res = await fetch(`/api/offers/${encodeURIComponent(offer.id)}/price`, { method: "POST" });
      const data = await res.json();
      setCheck(res.ok ? data : { available: false, checkedAt: new Date().toISOString() });
    } catch {
      setCheck({ available: false, checkedAt: new Date().toISOString() });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className={`card offer2${isBest ? " card-best" : ""}`}>
      {tags.length > 0 && (
        <div className="tags">
          {tags.map((t) => (
            <span key={t} className={tagClass(t)}>
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="offer2-main">
        <div className="offer2-logo">
          {offer.ownerLogoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={offer.ownerLogoUrl} alt="" width={38} height={38} />
          )}
          <span className="offer2-al">{offer.owner}</span>
        </div>

        <div className="offer2-legs">
          {offer.slices.map((s, i) => (
            <Leg key={i} slice={s} />
          ))}
        </div>

        <div className="offer2-price">
          <span className="offer2-amt">
            {currency} {offer.totalAmount.toFixed(2)}
          </span>
          <button type="button" className="btn-ghost" onClick={confirmPrice} disabled={checking}>
            {checking ? "Checking…" : "Confirm price"}
          </button>
        </div>
      </div>

      <div className="offer2-sub">
        <span>{offer.cabinClass.replace(/_/g, " ")}</span>
        <span>· comfort {comfortScore}/100</span>
        <span>· {reasons.join(" · ")}</span>
      </div>

      {check &&
        (check.available ? (
          <div className="confirm-ok" style={{ marginTop: 8 }}>
            ✓ Confirmed {check.currency ?? currency} {(check.totalAmount ?? offer.totalAmount).toFixed(2)}
            {check.expiresAt ? ` · hold until ${fmtClock(check.expiresAt)}` : ""} — book directly with {offer.owner}.
          </div>
        ) : (
          <div className="confirm-bad" style={{ marginTop: 8 }}>
            This fare is no longer available — please re-search for a live price.
          </div>
        ))}
    </div>
  );
}
