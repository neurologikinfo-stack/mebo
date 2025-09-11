import { headers } from "next/headers";
import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

export async function POST(req) {
  const payload = await req.text();
  const headerPayload = headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Error verificando webhook Clerk:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  const { data } = evt;
  const supabase = supabaseServer();

  try {
    const email = data.email_addresses?.[0]?.email_address || null;
    const fullName = data.first_name || "";
    const clerkId = data.id;

    // 🔹 Nueva lógica de roles
    let role = data.public_metadata?.role || null;

    // Admins por correo
    const adminEmails = ["admin@mebo.com"];
    if (adminEmails.includes(email)) {
      role = "admin";
    }

    // Si aún no hay rol, asumimos "customer"
    if (!role) {
      role = "customer";
    }

    console.log("👤 Webhook user.created:", { email, role, clerkId });

    // ==============================
    // Insertar/actualizar en profiles
    // ==============================
    await supabase.from("profiles").upsert(
      {
        clerk_id: clerkId,
        email,
        full_name: fullName,
        role,
      },
      { onConflict: "clerk_id" }
    );

    // ==============================
    // Si es Owner, insertar en owners
    // ==============================
    if (role === "owner") {
      await supabase.from("owners").upsert(
        {
          clerk_id: clerkId,
          email,
          full_name: fullName,
        },
        { onConflict: "clerk_id" }
      );
      console.log("🏠 Usuario sincronizado en owners:", email);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Error procesando webhook Clerk:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
