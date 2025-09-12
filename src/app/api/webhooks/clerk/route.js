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

  const { data, type } = evt;
  const supabase = supabaseServer();

  try {
    const email = data.email_addresses?.[0]?.email_address || null;
    const fullName = [data.first_name, data.last_name]
      .filter(Boolean)
      .join(" ");
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

    console.log(`👤 Webhook ${type}:`, { email, role, clerkId });

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
    // Si es Owner, actualizar estado en owners
    // ==============================
    if (role === "owner") {
      const { error } = await supabase
        .from("owners")
        .update({
          clerk_id: clerkId,
          full_name: fullName,
          status: "active", // 👈 ahora ya está activo
        })
        .eq("email", email) // 👈 busca por email
        .is("clerk_id", null); // 👈 solo si estaba vacío (pendiente)

      if (error) {
        console.error("❌ Error actualizando owner en Supabase:", error);
      } else {
        console.log("🏠 Owner activado en Supabase:", email);
      }
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
