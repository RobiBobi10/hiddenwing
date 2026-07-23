"use client";

import { useState } from "react";
import type { NormalizedQuery } from "@/domain/providers/provider-port";
import ResultsList, { type SearchResults } from "@/app/search/results-list";
import AirportInput from "@/components/airport-input";
import DateCalendar from "@/components/date-calendar";

const CABINS = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

interface ApiData {
  results?: SearchResults["scored"];
  anchors?: SearchResults["anchors"];
  currency?: string;
  query?: NormalizedQuery;
  interpreted?: string;
  removed?: number;
  searched?: number;
  message?: string;
  error?: string;
}

export default function HomeSearch({ authed }: { authed: boolean }) {
  const [ai, setAi] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");
  const [tripType, setTripType] = useState<"return" | "oneway">("return");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabin, setCabin] = useState("economy");
  const [flexDays, setFlexDays] = useState(0);
  const [nearby, setNearby] = useState(false);
  const [direct, setDirect] = useState(false);

  const [results, setResults] = useState<SearchResults | null>(null);
  const [query, setQuery] = useState<NormalizedQuery | null>(null);
  const [interpreted, setInterpreted] = useState<string | null>(null);
  const [loading, setLoading] = useState<"ai" | "manual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function requireAuth() {
    if (!authed) {
      window.location.href = "/sign-in";
      return false;
    }
    return true;
  }

  function apply(data: ApiData) {
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

  async function onAi(e: React.FormEvent) {
    e.preventDefault();
    if (!ai.trim() || !requireAuth()) return;
    setLoading("ai");
    setError(null);
    setResults(null);
    setInterpreted(null);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ai }),
      });
      const data: ApiData = await res.json();
      if (!res.ok) setError(data?.message ?? "The AI couldn't process that. Try the fields below.");
      else apply(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function onManual(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAuth()) return;
    setLoading("manual");
    setError(null);
    setResults(null);
    setInterpreted(null);
    const body = {
      origin: from,
      destination: to,
      departureDate: depart,
      returnDate: tripType === "oneway" ? "" : ret,
      adults,
      children,
      infants: 0,
      cabinClass: cabin,
      flexDays,
      includeNearby: nearby,
    };
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: ApiData = await res.json();
      if (!res.ok)
        setError(
          data?.error === "invalid_input"
            ? "Please check your search details and try again."
            : (data?.message ?? "Search failed. Please try again."),
        );
      else apply(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <form onSubmit={onAi} className="search-ai">
        <span style={{ fontSize: 18 }}>✦</span>
        <input
          value={ai}
          onChange={(e) => setAi(e.target.value)}
          placeholder="Describe your trip — “cheap flights from London to New York in September, 2 adults”"
        />
        <button type="submit" className="btn" style={{ padding: "9px 16px", fontSize: 14 }} disabled={loading !== null}>
          {loading === "ai" ? "…" : "Search with AI ✦"}
        </button>
      </form>

      <div className="search-or">— or search by fields —</div>

      <form onSubmit={onManual} className="search-bar">
        <div className="search-fields">
          <AirportInput label="From" value={from} onChange={setFrom} placeholder="City or airport" />
          <AirportInput label="To" value={to} onChange={setTo} placeholder="City or airport" />
          <DateCalendar
            label="Depart"
            value={depart}
            onChange={setDepart}
            origin={from}
            destination={to}
            adults={adults}
            cabinClass={cabin}
            direct={direct}
          />
          {tripType === "return" ? (
            <DateCalendar
              label="Return"
              value={ret}
              onChange={setRet}
              origin={to}
              destination={from}
              adults={adults}
              cabinClass={cabin}
              direct={direct}
              minDate={depart}
            />
          ) : (
            <div className="sf">
              <label>Return</label>
              <div className="cal-value muted">One-way</div>
            </div>
          )}
          <div className="sf">
            <label>Adults</label>
            <input type="number" min={1} max={9} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
          </div>
          <div className="sf">
            <label>Cabin</label>
            <select value={cabin} onChange={(e) => setCabin(e.target.value)}>
              {CABINS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="sf-search" disabled={loading !== null}>
            {loading === "manual" ? "…" : "Search"}
          </button>
        </div>

        <div className="search-ticks">
          <span className="seg">
            <button type="button" className={tripType === "return" ? "on" : ""} onClick={() => setTripType("return")}>
              Return
            </button>
            <button type="button" className={tripType === "oneway" ? "on" : ""} onClick={() => setTripType("oneway")}>
              One-way
            </button>
          </span>
          <label>
            <input type="checkbox" checked={flexDays > 0} onChange={(e) => setFlexDays(e.target.checked ? 2 : 0)} /> Flexible
            dates (±2)
          </label>
          <label>
            <input type="checkbox" checked={nearby} onChange={(e) => setNearby(e.target.checked)} /> Nearby airports
          </label>
          <label>
            <input type="checkbox" checked={direct} onChange={(e) => setDirect(e.target.checked)} /> Direct only
          </label>
          <label>
            <input type="checkbox" checked={children > 0} onChange={(e) => setChildren(e.target.checked ? 1 : 0)} /> With
            children
          </label>
        </div>
      </form>

      {error && (
        <div className="status" style={{ marginTop: 16, color: "#ffb4b4" }}>
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
      {results && <ResultsList results={results} query={query} defaultDirect={direct} />}
    </>
  );
}
