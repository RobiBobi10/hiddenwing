"use client";

import { useEffect, useState } from "react";

interface ProfileData {
  valueOfTimePerHour: number;
  checkedBagsNeeded: number;
  estimatedBagFee: number;
  perStopPenalty: number;
  redEyePenalty: number;
  comfortWeight: number;
  noRedEye: boolean;
  maxStops: number | null;
}

const NUM_FIELDS: { key: keyof ProfileData; label: string; hint: string }[] = [
  { key: "valueOfTimePerHour", label: "Value of time (per hour)", hint: "Higher = you'd pay more to save travel time." },
  { key: "checkedBagsNeeded", label: "Checked bags needed", hint: "Fares with fewer bags get an estimated fee added." },
  { key: "estimatedBagFee", label: "Estimated bag fee", hint: "Assumed cost per missing checked bag." },
  { key: "perStopPenalty", label: "Penalty per stop", hint: "How much a connection is worth avoiding." },
  { key: "redEyePenalty", label: "Red-eye penalty", hint: "How much you dislike overnight departures." },
  { key: "comfortWeight", label: "Comfort weight", hint: "How much cabin/comfort influences the ranking." },
];

export default function ProfileForm() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setData(d.profile))
      .catch(() => setStatus("Couldn't load your profile."));
  }, []);

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((d) => (d ? { ...d, [key]: value } : d));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "Saved. Your next search will use these." : "Save failed — check your values.");
    } catch {
      setStatus("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return <div className="status"><span className="dot" /> Loading your preferences…</div>;
  }

  return (
    <form onSubmit={onSave} className="search-form">
      <div className="field-row">
        {NUM_FIELDS.slice(0, 2).map((f) => (
          <NumField key={f.key} f={f} value={data[f.key] as number} onChange={(v) => set(f.key, v as never)} />
        ))}
      </div>
      <div className="field-row">
        {NUM_FIELDS.slice(2, 4).map((f) => (
          <NumField key={f.key} f={f} value={data[f.key] as number} onChange={(v) => set(f.key, v as never)} />
        ))}
      </div>
      <div className="field-row">
        {NUM_FIELDS.slice(4, 6).map((f) => (
          <NumField key={f.key} f={f} value={data[f.key] as number} onChange={(v) => set(f.key, v as never)} />
        ))}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="noRedEye">Never show red-eye flights</label>
          <select
            id="noRedEye"
            value={data.noRedEye ? "yes" : "no"}
            onChange={(e) => set("noRedEye", e.target.value === "yes")}
          >
            <option value="no">No — just penalise them</option>
            <option value="yes">Yes — hide them completely</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="maxStops">Maximum stops</label>
          <select
            id="maxStops"
            value={data.maxStops === null ? "any" : String(data.maxStops)}
            onChange={(e) => set("maxStops", e.target.value === "any" ? null : Number(e.target.value))}
          >
            <option value="any">Any</option>
            <option value="0">Direct only</option>
            <option value="1">Up to 1 stop</option>
            <option value="2">Up to 2 stops</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Saving…" : "Save preferences"}
      </button>

      {status && (
        <div className="status" style={{ marginTop: 4 }}>
          <span className="dot" /> {status}
        </div>
      )}
    </form>
  );
}

function NumField({
  f,
  value,
  onChange,
}: {
  f: { key: string; label: string; hint: string };
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={f.key}>{f.label}</label>
      <input
        id={f.key}
        type="number"
        min={0}
        max={500}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="muted" style={{ fontSize: 12 }}>{f.hint}</span>
    </div>
  );
}
