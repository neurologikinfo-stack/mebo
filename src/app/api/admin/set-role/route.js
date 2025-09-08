export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service key para saltar RLS
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

    // 🔑 Actualizar solo en Supabase
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

    console.log("✅ Rol actualizado en Supabase:", { clerk_id, role });

    return NextResponse.json({
      success: true,
      message: `Rol actualizado a '${role}' en Supabase`,
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
