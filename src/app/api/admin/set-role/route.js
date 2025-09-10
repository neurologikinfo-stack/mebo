export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/clerk-sdk-node"; // 👈 usar este

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { clerk_id, role } = await req.json();

    if (!clerk_id || !role) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros (clerk_id, role)" },
        { status: 400 }
      );
    }

    const validRoles = ["owner", "customer", "staff", "user", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Rol inválido" },
        { status: 400 }
      );
    }

    // 1️⃣ Actualizar en Clerk
    await clerkClient.users.updateUser(clerk_id, {
      publicMetadata: { role },
    });

    // 2️⃣ Actualizar en Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_id", clerk_id);

    if (error) {
      console.error("❌ Error actualizando Supabase:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Rol actualizado en Clerk y Supabase:", { clerk_id, role });

    return NextResponse.json({
      success: true,
      message: `Rol actualizado a '${role}' en Clerk y Supabase`,
      newRole: role,
    });
  } catch (err) {
    console.error("❌ Error en set-role:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
