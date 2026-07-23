// POST /api/ai/explain — a grounded, plain-language explanation of the best-value pick.
// Receives numbers already computed by the deterministic engine; the AI only phrases
// them. The prices/ranking the user sees always come from the engine, not this text.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GeminiAdapter } from "@/features/ai/gemini/gemini-adapter";
import type { ExplainInput } from "@/domain/ai/ai-port";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Partial<ExplainInput> | null;
  if (!body?.best || !body?.query) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const explanation = await new GeminiAdapter().explain(body as ExplainInput);
    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("[ai/explain] error:", err);
    return NextResponse.json(
      { error: "ai_error", message: "Couldn't generate an explanation right now." },
      { status: 502 },
    );
  }
}
