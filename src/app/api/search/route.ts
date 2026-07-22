// POST /api/search — protected. Validates input, runs the search + TTV ranking,
// returns scored results with anchors. The Duffel token never leaves the server.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildSearchSchema } from "@/lib/validation/search-schema";
import { runSearch } from "@/features/search/search-service";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = buildSearchSchema().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await runSearch(parsed.data, { userId });
    return NextResponse.json({
      results: result.scored,
      anchors: result.anchors,
      currency: result.currency,
      count: result.count,
    });
  } catch (err) {
    console.error("[api/search] provider error:", err);
    return NextResponse.json(
      {
        error: "provider_error",
        message: "The flight provider couldn't complete this search. Please try again.",
      },
      { status: 502 },
    );
  }
}
