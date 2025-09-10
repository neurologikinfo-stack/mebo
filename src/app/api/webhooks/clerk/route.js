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

      // 👇 siempre guardamos en profiles
      const { error: profileError } = await supabase.from("profiles").upsert(
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

      if (profileError) {
        console.error(
          "❌ Error guardando usuario en profiles:",
          profileError.message
        );
      } else {
        console.log(`✅ Usuario sincronizado en profiles: ${email} (${role})`);
      }

      // 👇 si es OWNER => lo guardamos en owners
      if (role === "owner") {
        const { error: ownerError } = await supabase.from("owners").upsert(
          {
            clerk_id: data.id,
            full_name,
            email,
            created_at: new Date().toISOString(),
          },
          { onConflict: "clerk_id" }
        );

        if (ownerError) {
          console.error(
            "❌ Error guardando usuario en owners:",
            ownerError.message
          );
        } else {
          console.log(`🏠 Usuario sincronizado en owners: ${email}`);
        }
      } else {
        // Si ya no es owner => eliminarlo de owners
        await supabase.from("owners").delete().eq("clerk_id", data.id);
        console.log(`🗑 Usuario eliminado de owners: ${data.id}`);
      }
    }

    if (eventType === "user.deleted") {
      await supabase.from("profiles").delete().eq("clerk_id", data.id);
      await supabase.from("owners").delete().eq("clerk_id", data.id);
      console.log(`🗑 Usuario eliminado de profiles y owners: ${data.id}`);
    }
  } catch (err) {
    console.error("❌ Error general en webhook:", err.message);
  }

  return NextResponse.json({ ok: true });
}
