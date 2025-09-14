export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service role (bypassa RLS)
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerk_id");

    if (clerkId) {
      // 🔹 Usamos la función segura para traer un perfil
      const { data, error } = await supabase.rpc("admin_get_profile", {
        clerk_id_input: clerkId,
      });

      if (error) throw error;
      if (!data) {
        return NextResponse.json(
          { ok: false, error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ ok: true, data });
    }

    // 🔹 Usamos la función segura para traer todos
    const { data, error } = await supabase.rpc("admin_list_profiles");

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("❌ Error en /api/admin/users:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
