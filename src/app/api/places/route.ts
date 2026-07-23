// GET /api/places?q= — airport/city autocomplete suggestions (Duffel Places).

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { searchPlaces } from "@/features/search/duffel/duffel-places";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ places: [] }, { status: 401 });

  const rl = rateLimit(`places:${userId}`, 90, 60_000);
  if (!rl.ok) return NextResponse.json({ places: [] });

  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    const places = await searchPlaces(q);
    return NextResponse.json({ places });
  } catch (err) {
    console.error("[api/places] error:", err);
    return NextResponse.json({ places: [] });
  }
}
