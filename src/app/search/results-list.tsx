"use client";

import { useState } from "react";
import type { ScoredOffer } from "@/domain/optimization/ttv";
import type { Anchors } from "@/domain/optimization/rank";
import type { NormalizedQuery } from "@/domain/providers/provider-port";
import OfferCard from "./offer-card";

export interface SearchResults {
  scored: ScoredOffer[];
  anchors: Anchors;
  currency: string;
  removed?: number; // hidden by the user's hard constraints
}

export default function ResultsList({
  results,
  query,
}: {
  results: SearchResults;
  query: NormalizedQuery | null;
}) {
  const { scored, anchors, currency } = results;
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);

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
        {scored.length} option{scored.length === 1 ? "" : "s"} · <strong>best value first</strong>
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

      <div style={{ display: "grid", gap: 12 }}>
        {scored.map((s) => (
          <OfferCard key={s.offer.id} scored={s} currency={currency} />
        ))}
      </div>
    </div>
  );
}
