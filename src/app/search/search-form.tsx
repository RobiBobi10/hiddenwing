"use client";

import { useState } from "react";
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
};

export default function SearchForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
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
      setResults({ scored: data.results ?? [], anchors: data.anchors ?? {}, currency: data.currency ?? "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="search-form">
        <div className="field-row">
          <div className="field">
            <label htmlFor="origin">From</label>
            <input
              id="origin"
              placeholder="LHR"
              maxLength={3}
              value={form.origin}
              onChange={(e) => update("origin", e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="destination">To</label>
            <input
              id="destination"
              placeholder="JFK"
              maxLength={3}
              value={form.destination}
              onChange={(e) => update("destination", e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="departureDate">Depart</label>
            <input
              id="departureDate"
              type="date"
              value={form.departureDate}
              onChange={(e) => update("departureDate", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="returnDate">Return (optional)</label>
            <input
              id="returnDate"
              type="date"
              value={form.returnDate}
              onChange={(e) => update("returnDate", e.target.value)}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="adults">Adults</label>
            <input
              id="adults"
              type="number"
              min={1}
              max={9}
              value={form.adults}
              onChange={(e) => update("adults", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="cabinClass">Cabin</label>
            <select
              id="cabinClass"
              value={form.cabinClass}
              onChange={(e) => update("cabinClass", e.target.value)}
            >
              {CABINS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="children">Children</label>
            <input
              id="children"
              type="number"
              min={0}
              max={8}
              value={form.children}
              onChange={(e) => update("children", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="infants">Infants</label>
            <input
              id="infants"
              type="number"
              min={0}
              max={8}
              value={form.infants}
              onChange={(e) => update("infants", Number(e.target.value))}
            />
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Searching…" : "Search flights"}
        </button>
      </form>

      {error && (
        <div className="status" style={{ color: "#ffb4b4" }}>
          <span className="dot" style={{ background: "#ff6b6b", boxShadow: "none" }} />
          {error}
        </div>
      )}

      {results && <ResultsList results={results} />}
    </>
  );
}
