// GET  /api/profile — the signed-in user's profile (or defaults if none saved).
// POST /api/profile — validate + save the profile.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { loadProfile, saveProfile } from "@/features/profile/profile-repo";
import { profileSchema } from "@/lib/validation/profile-schema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, exists } = await loadProfile(userId);
  return NextResponse.json({ profile: data, exists });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await saveProfile(userId, parsed.data);
    return NextResponse.json({ ok: true, profile: parsed.data });
  } catch (err) {
    console.error("[api/profile] save error:", err);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
