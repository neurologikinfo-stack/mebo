import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server"; // 👈 para actualizar en Clerk

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { clerk_id, full_name, email, role } = await req.json();

    if (!clerk_id) {
      return NextResponse.json(
        { success: false, error: "clerk_id requerido" },
        { status: 400 }
      );
    }

    // 🔹 1. Actualizar en Clerk
    try {
      await clerkClient.users.updateUser(clerk_id, {
        emailAddress: email ? [{ emailAddress: email }] : undefined,
        publicMetadata: { role },
      });
    } catch (clerkErr) {
      console.error("❌ Error actualizando en Clerk:", clerkErr);
      return NextResponse.json(
        { success: false, error: "No se pudo actualizar en Clerk" },
        { status: 500 }
      );
    }

    // 🔹 2. Actualizar en Supabase
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name, email, role })
      .eq("clerk_id", clerk_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    console.error("❌ Error en update-user:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
