import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";

/**
 * Receives Clerk's user.created / user.updated / user.deleted events and keeps
 * our own `User` table in sync. Configure this URL (https://<your-app>/api/webhooks/clerk)
 * in the Clerk dashboard → Webhooks, and put its signing secret in
 * CLERK_WEBHOOK_SECRET (see .env.example).
 */

type ClerkUserPayload = {
  type: string;
  data: {
    id: string;
    email_addresses: { id: string; email_address: string }[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(secret);

  let event: ClerkUserPayload;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserPayload;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address;

    if (primaryEmail) {
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
      await db.user.upsert({
        where: { clerkId: data.id },
        update: { email: primaryEmail, name },
        create: { clerkId: data.id, email: primaryEmail, name },
      });
    }
  }

  if (type === "user.deleted") {
    await db.user.deleteMany({ where: { clerkId: data.id } });
  }

  return new Response("ok", { status: 200 });
}
