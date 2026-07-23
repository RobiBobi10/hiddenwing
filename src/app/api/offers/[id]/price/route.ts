// POST /api/offers/:id/price — live re-validation of one offer before any booking
// handoff (M6, NFR-12). Returns the confirmed price + expiry, or available:false.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { DuffelAdapter } from "@/features/search/duffel/duffel-adapter";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rl = rateLimit(`price:${userId}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited", message: "Please wait a moment." }, { status: 429 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const result = await new DuffelAdapter().price(id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/offers/price] error:", err);
    return NextResponse.json({ error: "provider_error" }, { status: 502 });
  }
}
