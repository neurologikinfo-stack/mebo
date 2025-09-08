// /app/api/webhooks/clerk/route.js
export const runtime = "nodejs";

import { headers } from "next/headers";
import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { users } from "@clerk/clerk-sdk-node"; // 👈 importante para actualizar Clerk

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const payload = await req.text();
  const headerPayload = headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("📩 Webhook recibido", { svix_id, svix_timestamp });

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Firma inválida:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type: eventType, data } = evt;

  const email =
    data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
      ?.email_address || null;

  const full_name =
    [data.first_name, data.last_name].filter(Boolean).join(" ") ||
    data.username ||
    null;

  const avatar_url = data.image_url ? `${data.image_url}?size=256` : null;

  const role = data.public_metadata?.role || "user";

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      // 👇 nos aseguramos que el rol exista en Clerk metadata
      await users.updateUser(data.id, {
        publicMetadata: {
          ...data.public_metadata,
          role,
        },
      });

      // 👇 también lo guardamos en Supabase
      const { error } = await supabase.from("profiles").upsert(
        {
          clerk_id: data.id,
          email,
          full_name,
          avatar_url,
          role,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "clerk_id" }
      );

      if (error) {
        console.error("❌ Error guardando usuario en Supabase:", error.message);
      } else {
        console.log(`✅ Usuario sincronizado: ${email} (${role})`);
      }
    }

    if (eventType === "user.deleted") {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("clerk_id", data.id);
      if (error) {
        console.error("❌ Error eliminando usuario:", error.message);
      } else {
        console.log(`🗑 Usuario eliminado: ${data.id}`);
      }
    }
  } catch (err) {
    console.error("❌ Error general en webhook:", err.message);
  }

  return NextResponse.json({ ok: true });
}
