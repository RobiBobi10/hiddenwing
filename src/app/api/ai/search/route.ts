// POST /api/ai/search — natural-language search. Parse free text with the AI, then
// run it through the SAME validation + deterministic search as the manual form. The
// AI proposes; buildSearchSchema disposes — a bad parse can never run a bad search.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildSearchSchema } from "@/lib/validation/search-schema";
import { runSearch } from "@/features/search/search-service";
import { loadProfile } from "@/features/profile/profile-repo";
import { GeminiAdapter } from "@/features/ai/gemini/gemini-adapter";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rl = rateLimit(`ai-search:${userId}`, 15, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many AI searches — please wait a moment." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "empty", message: "Please describe your trip." }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  let parsed;
  try {
    parsed = await new GeminiAdapter().parseTripRequest(text, today);
  } catch (err) {
    console.error("[ai/search] parse error:", err);
    return NextResponse.json(
      { error: "ai_error", message: "The AI couldn't process that right now — please use the form below." },
      { status: 502 },
    );
  }

  // Validate through the SAME schema as manual search (structural safety, not trust).
  const check = buildSearchSchema().safeParse({
    origin: parsed.origin,
    destination: parsed.destination,
    departureDate: parsed.departureDate,
    returnDate: parsed.returnDate ?? "",
    adults: parsed.adults,
    children: parsed.children,
    infants: parsed.infants,
    cabinClass: parsed.cabinClass,
  });

  if (!check.success) {
    const understood = parsed.interpretation ? ` I understood: ${parsed.interpretation}.` : "";
    return NextResponse.json(
      {
        error: "unparseable",
        message: `I couldn't turn that into a valid search.${understood} Try naming a city or airport and a date — or use the form below.`,
      },
      { status: 422 },
    );
  }

  try {
    const { preferences, constraints } = await loadProfile(userId);
    const result = await runSearch(check.data, { userId, preferences, constraints });
    return NextResponse.json({
      interpreted: parsed.interpretation,
      query: check.data,
      results: result.scored,
      anchors: result.anchors,
      currency: result.currency,
      count: result.count,
      removed: result.removedByConstraints,
    });
  } catch (err) {
    console.error("[ai/search] search error:", err);
    return NextResponse.json(
      {
        error: "provider_error",
        interpreted: parsed.interpretation,
        message: `I understood “${parsed.interpretation}”, but couldn't get flights for that route right now. In test mode not every route/date is available — try a common route like London–New York.`,
      },
      { status: 502 },
    );
  }
}
