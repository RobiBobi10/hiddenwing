// Airport/city autocomplete via Duffel's Place Suggestions API. Server-only.

import { getDuffelClient } from "./duffel-client";

export interface PlaceSuggestion {
  iata: string;
  name: string;
  city?: string;
  country?: string;
  type: string; // "airport" | "city"
}

interface DuffelPlace {
  type?: string;
  name?: string;
  iata_code?: string | null;
  iata_city_code?: string | null;
  city_name?: string | null;
  iata_country_code?: string | null;
  city?: { name?: string | null } | null;
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const duffel = getDuffelClient();
  // The SDK exposes the places suggestions endpoint as `suggestions.list`.
  const res = await (duffel as unknown as {
    suggestions: { list: (p: { query: string }) => Promise<{ data?: DuffelPlace[] }> };
  }).suggestions.list({ query: q });

  const data = res?.data ?? [];
  return data
    .map((p) => ({
      iata: (p.iata_code ?? p.iata_city_code ?? "").toUpperCase(),
      name: p.name ?? "",
      city: p.city_name ?? p.city?.name ?? undefined,
      country: p.iata_country_code ?? undefined,
      type: p.type ?? "airport",
    }))
    .filter((p) => p.iata.length === 3)
    .slice(0, 8);
}
