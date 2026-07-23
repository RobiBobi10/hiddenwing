"use client";

import { useState } from "react";
import type { NormalizedQuery } from "@/domain/providers/provider-port";
import ResultsList, { type SearchResults } from "./results-list";

const CABINS = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

interface FormState {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  flexDays: number;
  includeNearby: boolean;
}

const INITIAL: FormState = {
  origin: "",
  destination: "",
  departureDate: "",
  returnDate: "",
  adults: 1,
  children: 0,
  infants: 0,
  cabinClass: "economy",
  flexDays: 0,
  includeNearby: false,
};

export default function SearchPanel() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [aiText, setAiText] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [query, setQuery] = useState<NormalizedQuery | null>(null);
  const [interpreted, setInterpreted] = useState<string | null>(null);
  const [loading, setLoading] = useState<"manual" | "ai" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function applyResponse(data: {
    results?: SearchResults["scored"];
    anchors?: SearchResults["anchors"];
    currency?: string;
    query?: NormalizedQuery;
    interpreted?: string | null;
    removed?: number;
    searched?: number;
  }) {
    setResults({
      scored: data.results ?? [],
      anchors: data.anchors ?? ({} as SearchResults["anchors"]),
      currency: data.currency ?? "",
      removed: data.removed ?? 0,
      searched: data.searched ?? 1,
    });
    setQuery(data.query ?? null);
    setInterpreted(data.interpreted ?? null);
  }

  async function onManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading("manual");
    setError(null);
    setResults(null);
    setInterpreted(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error === "invalid_input"
            ? "Please check your search details and try again."
            : (data?.message ?? "Search failed. Please try again."),
        );
        return;
      }
      applyResponse(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function onAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aiText.trim()) return;
    setLoading("ai");
    setError(null);
    setResults(null);
    setInterpreted(null);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "The AI couldn't process that. Try the form below.");
        return;
      }
      applyResponse(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <form onSubmit={onAiSubmit} className="search-form" style={{ marginBottom: 16 }}>
        <div className="field">
          <label htmlFor="aiText">Describe your trip</label>
          <textarea
            id="aiText"
            rows={2}
            placeholder="e.g. cheap flights from London to New York in September, 2 adults"
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            style={{
              background: "#0e1526",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "var(--text)",
              fontSize: 15,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button type="submit" className="btn" disabled={loading !== null}>
          {loading === "ai" ? "Understanding…" : "Search with AI ✦"}
        </button>
      </form>

      <p className="muted" style={{ textAlign: "center", margin: "0 0 16px", fontSize: 13 }}>
        — or search by fields —
      </p>

      <form onSubmit={onManualSubmit} className="search-form">
        <div className="field-row">
          <div className="field">
            <label htmlFor="origin">From</label>
            <input id="origin" placeholder="LHR" maxLength={3} value={form.origin}
              onChange={(e) => update("origin", e.target.value.toUpperCase())} required />
          </div>
          <div className="field">
            <label htmlFor="destination">To</label>
            <input id="destination" placeholder="JFK" maxLength={3} value={form.destination}
              onChange={(e) => update("destination", e.target.value.toUpperCase())} required />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="departureDate">Depart</label>
            <input id="departureDate" type="date" value={form.departureDate}
              onChange={(e) => update("departureDate", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="returnDate">Return (optional)</label>
            <input id="returnDate" type="date" value={form.returnDate}
              onChange={(e) => update("returnDate", e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="adults">Adults</label>
            <input id="adults" type="number" min={1} max={9} value={form.adults}
              onChange={(e) => update("adults", Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="cabinClass">Cabin</label>
            <select id="cabinClass" value={form.cabinClass}
              onChange={(e) => update("cabinClass", e.target.value)}>
              {CABINS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="children">Children</label>
            <input id="children" type="number" min={0} max={8} value={form.children}
              onChange={(e) => update("children", Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="infants">Infants</label>
            <input id="infants" type="number" min={0} max={8} value={form.infants}
              onChange={(e) => update("infants", Number(e.target.value))} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="flexDays">Flexible dates</label>
            <select
              id="flexDays"
              value={form.flexDays}
              onChange={(e) => update("flexDays", Number(e.target.value))}
            >
              <option value={0}>Exact dates</option>
              <option value={1}>± 1 day</option>
              <option value={2}>± 2 days</option>
              <option value={3}>± 3 days</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="includeNearby">Nearby airports</label>
            <select
              id="includeNearby"
              value={form.includeNearby ? "yes" : "no"}
              onChange={(e) => update("includeNearby", e.target.value === "yes")}
            >
              <option value="no">This airport only</option>
              <option value="yes">Include nearby airports</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading !== null}>
          {loading === "manual" ? "Searching…" : "Search flights"}
        </button>
      </form>

      {error && (
        <div className="status" style={{ color: "#ffb4b4" }}>
          <span className="dot" style={{ background: "#ff6b6b", boxShadow: "none" }} />
          {error}
        </div>
      )}

      {interpreted && (
        <div className="status" style={{ marginTop: 16 }}>
          <span className="dot" />
          <span>
            <strong>I understood:</strong> {interpreted}
          </span>
        </div>
      )}

      {results && <ResultsList results={results} query={query} />}
    </>
  );
}
