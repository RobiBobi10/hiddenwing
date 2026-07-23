// POST /api/price-calendar — cheapest fare per day for a month (bounded + cached).
// Expensive (many searches); heavily rate-limited.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { CabinClass } from "@/domain/providers/provider-port";
import { monthPrices } from "@/features/search/price-calendar";
import { rateLimit } from "@/lib/rate-limit";

const CABINS: CabinClass[] = ["economy", "premium_economy", "business", "first"];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rl = rateLimit(`pricecal:${userId}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited", message: "Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const origin = String(body?.origin ?? "").toUpperCase();
  const destination = String(body?.destination ?? "").toUpperCase();
  const year = Number(body?.year);
  const month = Number(body?.month);
  const adults = Math.max(1, Math.min(9, Number(body?.adults ?? 1)));
  const cabinRaw = String(body?.cabinClass ?? "economy") as CabinClass;
  const cabinClass = CABINS.includes(cabinRaw) ? cabinRaw : "economy";
  const direct = Boolean(body?.direct);

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || !year || !month) {
    return NextResponse.json({ error: "bad_request", days: {} }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  try {
    const result = await monthPrices({ origin, destination, year, month, adults, cabinClass, direct, today });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/price-calendar] error:", err);
    return NextResponse.json({ error: "provider_error", days: {} }, { status: 502 });
  }
}
