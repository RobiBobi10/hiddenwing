import { NextResponse } from "next/server";
import { getHealth } from "@/lib/health";
import { db } from "@/lib/db";

export async function GET() {
  const health = await getHealth(process.env.DATABASE_URL, async () => {
    await db.$queryRaw`SELECT 1`;
    return true;
  });
  return NextResponse.json(health, { status: health.db === "error" ? 503 : 200 });
}
