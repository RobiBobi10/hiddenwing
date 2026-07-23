"use client";

import { useEffect, useRef, useState } from "react";

interface Place {
  iata: string;
  name: string;
  city?: string;
  country?: string;
  type: string;
}

export default function AirportInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (iata: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState(value);
  const [places, setPlaces] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) {
      setPlaces([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(t)}`);
        const data = await res.json();
        setPlaces(data.places ?? []);
      } catch {
        setPlaces([]);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(p: Place) {
    onChange(p.iata);
    setQ(`${p.city ?? p.name} (${p.iata})`);
    setPlaces([]);
    setOpen(false);
  }

  return (
    <div className="sf" ref={boxRef} style={{ position: "relative" }}>
      <label>{label}</label>
      <input
        value={q}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          const v = e.target.value;
          setQ(v);
          setOpen(true);
          // keep raw 3-letter codes working directly
          if (v.trim().length <= 3) onChange(v.trim().toUpperCase());
        }}
        onFocus={() => places.length > 0 && setOpen(true)}
      />
      {open && places.length > 0 && (
        <div className="ac">
          {places.map((p) => (
            <button type="button" key={`${p.iata}-${p.name}`} className="ac-item" onClick={() => pick(p)}>
              <span className="ac-i">{p.type === "city" ? "🏙️" : "✈️"}</span>
              <span className="ac-txt">
                <b>
                  {p.city ?? p.name} <span className="muted">({p.iata})</span>
                </b>
                <span className="ac-sub">
                  {p.name}
                  {p.country ? ` · ${p.country}` : ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
