"use client";

import { useState } from "react";
import type { NormalizedSlice } from "@/domain/offer/offer";
import type { ScoredOffer } from "@/domain/optimization/ttv";

function fmtTime(iso: string): string {
  if (!iso) return "";
  const t = iso.slice(11, 16); // HH:MM
  return t || iso;
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
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
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

interface PriceCheck {
  available: boolean;
  totalAmount?: number;
  currency?: string;
  expiresAt?: string | null;
  checkedAt: string;
}

function SliceRow({ slice }: { slice: NormalizedSlice }) {
  const first = slice.segments[0];
  const last = slice.segments[slice.segments.length - 1];
  const date = fmtDate(first?.departingAt ?? "");
  return (
    <div className="offer-slice">
      {date && (
        <span className="muted" style={{ marginRight: 6 }}>
          {date}
        </span>
      )}
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
  const [check, setCheck] = useState<PriceCheck | null>(null);
  const [checking, setChecking] = useState(false);

  async function confirmPrice() {
    setChecking(true);
    setCheck(null);
    try {
      const res = await fetch(`/api/offers/${encodeURIComponent(offer.id)}/price`, {
        method: "POST",
      });
      const data = await res.json();
      setCheck(res.ok ? data : { available: false, checkedAt: new Date().toISOString() });
    } catch {
      setCheck({ available: false, checkedAt: new Date().toISOString() });
    } finally {
      setChecking(false);
    }
  }

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

      <div className="offer-confirm">
        <button type="button" className="btn-ghost" onClick={confirmPrice} disabled={checking}>
          {checking ? "Checking…" : "Confirm price"}
        </button>
        {check &&
          (check.available ? (
            <span className="confirm-ok">
              ✓ Confirmed {check.currency ?? currency}{" "}
              {(check.totalAmount ?? offer.totalAmount).toFixed(2)}
              {check.expiresAt ? ` · hold until ${fmtClock(check.expiresAt)}` : ""} — book directly
              with {offer.owner}.
            </span>
          ) : (
            <span className="confirm-bad">
              This fare is no longer available — please re-search for a live price.
            </span>
          ))}
      </div>
    </div>
  );
}
