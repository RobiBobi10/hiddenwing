"use client";

import { useEffect, useMemo, useState } from "react";
import type { ScoredOffer } from "@/domain/optimization/ttv";
import type { Anchors } from "@/domain/optimization/rank";
import type { NormalizedQuery } from "@/domain/providers/provider-port";
import OfferCard from "./offer-card";

export interface SearchResults {
  scored: ScoredOffer[];
  anchors: Anchors;
  currency: string;
  removed?: number;
  searched?: number;
}

type SortKey = "value" | "cheapest" | "fastest";

export default function ResultsList({
  results,
  query,
  defaultDirect = false,
}: {
  results: SearchResults;
  query: NormalizedQuery | null;
  defaultDirect?: boolean;
}) {
  const { scored, anchors, currency } = results;
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);

  const [sort, setSort] = useState<SortKey>("value");
  const [directOnly, setDirectOnly] = useState(defaultDirect);
  const [bagOnly, setBagOnly] = useState(false);
  const [airline, setAirline] = useState("all");

  const airlines = useMemo(
    () => Array.from(new Set(scored.map((s) => s.offer.owner))).sort(),
    [scored],
  );

  const displayed = useMemo(() => {
    let list = scored.filter((s) => {
      if (directOnly && s.metrics.totalStops > 0) return false;
      if (bagOnly && s.offer.baggage.checkedBags < 1) return false;
      if (airline !== "all" && s.offer.owner !== airline) return false;
      return true;
    });
    list = [...list];
    if (sort === "cheapest") list.sort((a, b) => a.offer.totalAmount - b.offer.totalAmount);
    else if (sort === "fastest")
      list.sort((a, b) => a.metrics.totalDurationMinutes - b.metrics.totalDurationMinutes);
    // "value" keeps the server's best-value order
    return list;
  }, [scored, sort, directOnly, bagOnly, airline]);

  const PAGE = 12;
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [sort, directOnly, bagOnly, airline, results]);
  const totalPages = Math.max(1, Math.ceil(displayed.length / PAGE));
  const pageItems = displayed.slice((page - 1) * PAGE, page * PAGE);

  if (scored.length === 0) {
    return (
      <div className="status">
        No flights found for this search. Try different dates or nearby airports.
      </div>
    );
  }

  const best = scored.find((s) => s.offer.id === anchors.bestValueId);
  const cheapest = scored.find((s) => s.offer.id === anchors.cheapestId);
  const delta =
    best && cheapest
      ? Math.round((best.offer.totalAmount - cheapest.offer.totalAmount) * 100) / 100
      : 0;

  let summary = "";
  if (best && cheapest) {
    if (best.offer.id === cheapest.offer.id) summary = "The best-value pick is also the cheapest.";
    else if (delta > 0)
      summary = `Best value costs ${currency} ${delta.toFixed(2)} more than the cheapest — ${best.reasons.join(", ").toLowerCase()}.`;
    else summary = `Best value: ${best.reasons.join(", ").toLowerCase()}.`;
  }

  async function explainPick() {
    if (!best || !query) return;
    setExplaining(true);
    setExplanation(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          currency,
          best: {
            owner: best.offer.owner,
            price: best.offer.totalAmount,
            stops: best.metrics.totalStops,
            durationMinutes: best.metrics.totalDurationMinutes,
            comfortScore: best.comfortScore,
            reasons: best.reasons,
            breakdown: best.breakdown,
          },
          cheapestPrice: cheapest?.offer.totalAmount ?? null,
        }),
      });
      const data = await res.json();
      setExplanation(res.ok ? data.explanation : (data?.message ?? "Couldn't explain right now."));
    } catch {
      setExplanation("Couldn't reach the AI. Please try again.");
    } finally {
      setExplaining(false);
    }
  }

  return (
    <div>
      <p className="lede" style={{ marginBottom: 8, marginTop: 24 }}>
        {displayed.length} of {scored.length} option{scored.length === 1 ? "" : "s"}
        {results.searched && results.searched > 1 ? (
          <span className="muted" style={{ fontSize: 14 }}>
            {" "}· searched {results.searched} date/airport combinations
          </span>
        ) : null}
      </p>
      {summary && (
        <p className="muted" style={{ marginTop: 0, marginBottom: 12, fontSize: 14 }}>
          {summary} <span style={{ opacity: 0.7 }}>Prices indicative, not a booking guarantee.</span>
        </p>
      )}
      {results.removed ? (
        <p className="muted" style={{ marginTop: 0, marginBottom: 12, fontSize: 13 }}>
          {results.removed} option{results.removed === 1 ? "" : "s"} hidden by your preferences.{" "}
          <a href="/profile">Adjust</a>
        </p>
      ) : null}

      {query && best && (
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            className="btn"
            onClick={explainPick}
            disabled={explaining}
            style={{ padding: "9px 14px", fontSize: 14 }}
          >
            {explaining ? "Thinking…" : "Why this pick? ✦"}
          </button>
          {explanation && (
            <div className="status" style={{ marginTop: 10, alignItems: "flex-start" }}>
              <span className="dot" style={{ marginTop: 4 }} />
              <span>{explanation}</span>
            </div>
          )}
        </div>
      )}

      <div className="filters">
        <div className="filter-item">
          <label htmlFor="sort">Sort</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="value">Best value</option>
            <option value="cheapest">Cheapest</option>
            <option value="fastest">Fastest</option>
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="airline">Airline</label>
          <select id="airline" value={airline} onChange={(e) => setAirline(e.target.value)}>
            <option value="all">All airlines</option>
            {airlines.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <label className="filter-toggle">
          <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} />
          Direct only
        </label>
        <label className="filter-toggle">
          <input type="checkbox" checked={bagOnly} onChange={(e) => setBagOnly(e.target.checked)} />
          Bag included
        </label>
      </div>

      {displayed.length === 0 ? (
        <div className="status">No options match these filters. Loosen them to see more.</div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {pageItems.map((s) => (
              <OfferCard key={s.offer.id} scored={s} currency={currency} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pager">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                ‹ Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
