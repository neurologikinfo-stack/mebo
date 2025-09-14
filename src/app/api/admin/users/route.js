export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerk_id");

    // 🔹 Si se pasa clerk_id -> buscar usuario específico
    if (clerkId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, clerk_id, email, full_name, role, created_at, updated_at")
        .eq("clerk_id", clerkId) // ✅ solo buscamos con prefijo "user_"
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return NextResponse.json(
          { ok: false, error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ ok: true, data });
    }

    // 🔹 Si no se pasa clerk_id -> listar todos
    const { data, error } = await supabase
      .from("profiles")
      .select("id, clerk_id, email, full_name, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("❌ Error en /api/admin/users:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
