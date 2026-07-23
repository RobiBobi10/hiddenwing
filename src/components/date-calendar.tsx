"use client";

import { useEffect, useRef, useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Remembers fetched months so reopening is instant (and survives closing the
// popover mid-load — the server still finishes + caches).
interface Cal {
  days: Record<string, number>;
  cheapest: string | null;
  currency: string;
}
const clientCache = new Map<string, Cal>();

function sym(c: string): string {
  if (c === "EUR") return "€";
  if (c === "USD") return "$";
  if (c === "GBP") return "£";
  return c ? `${c} ` : "";
}

export default function DateCalendar({
  label,
  value,
  onChange,
  origin,
  destination,
  adults,
  cabinClass,
  direct,
  minDate,
}: {
  label: string;
  value: string;
  onChange: (d: string) => void;
  origin: string;
  destination: string;
  adults: number;
  cabinClass: string;
  direct: boolean;
  minDate?: string;
}) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = value ? new Date(`${value}T00:00:00`) : today;
    return { y: base.getFullYear(), m: base.getMonth() + 1 };
  });
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [cheapest, setCheapest] = useState<string | null>(null);
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open || !showPrices) return;
    const ok = /^[A-Z]{3}$/.test(origin) && /^[A-Z]{3}$/.test(destination);
    if (!ok) {
      setPrices({});
      setCheapest(null);
      setLoading(false);
      return;
    }
    const key = `${origin}|${destination}|${view.y}-${view.m}|${adults}|${cabinClass}|${direct ? 1 : 0}`;
    const cached = clientCache.get(key);
    if (cached) {
      setPrices(cached.days);
      setCheapest(cached.cheapest);
      setCurrency(cached.currency);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/price-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, year: view.y, month: view.m, adults, cabinClass, direct }),
    })
      .then((r) => r.json())
      .then((d) => {
        const result: Cal = { days: d.days ?? {}, cheapest: d.cheapest ?? null, currency: d.currency ?? "" };
        clientCache.set(key, result); // cache even if the popover was closed
        if (cancelled) return;
        setPrices(result.days);
        setCheapest(result.cheapest);
        setCurrency(result.currency);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, showPrices, view.y, view.m, origin, destination, adults, cabinClass, direct]);

  const daysInMonth = new Date(view.y, view.m, 0).getDate();
  const firstDow = (new Date(view.y, view.m - 1, 1).getDay() + 6) % 7;
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${view.y}-${String(view.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  function shift(delta: number) {
    let m = view.m + delta;
    let y = view.y;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setView({ y, m });
  }
  function disabled(ds: string) {
    return ds < todayStr || (minDate ? ds < minDate : false);
  }
  function select(ds: string) {
    if (disabled(ds)) return;
    onChange(ds);
    setOpen(false);
  }

  const display = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
    : "";

  return (
    <div className="sf" ref={boxRef} style={{ position: "relative", cursor: "pointer" }} onClick={() => setOpen((o) => !o)}>
      <label>{label}</label>
      <div className="cal-value">{display || <span className="muted">Add date</span>}</div>
      {open && (
        <div className="cal" onClick={(e) => e.stopPropagation()}>
          <div className="cal-head">
            <button type="button" onClick={() => shift(-1)} className="cal-nav">‹</button>
            <span>{MONTHS[view.m - 1]} {view.y}</span>
            <button type="button" onClick={() => shift(1)} className="cal-nav">›</button>
          </div>
          <div className="cal-dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="cal-grid">
            {cells.map((ds, i) =>
              ds === null ? (
                <span key={`e${i}`} />
              ) : (
                <button
                  type="button"
                  key={ds}
                  className={`cal-day${ds === value ? " sel" : ""}${ds === cheapest ? " cheap" : ""}${disabled(ds) ? " dis" : ""}`}
                  onClick={() => select(ds)}
                  disabled={disabled(ds)}
                >
                  <b>{Number(ds.slice(8))}</b>
                  <span className="cal-price">{prices[ds] != null ? `${sym(currency)}${prices[ds]}` : ""}</span>
                </button>
              ),
            )}
          </div>
          <div className="cal-foot">
            {!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) ? (
              "Pick From & To first to see daily prices"
            ) : loading ? (
              "Loading prices… (test mode is slow)"
            ) : showPrices ? (
              <>Cheapest day highlighted{direct ? " · direct" : ""}</>
            ) : (
              <button type="button" className="cal-loadbtn" onClick={() => setShowPrices(true)}>
                Show cheapest prices for {MONTHS[view.m - 1]} ✦
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
