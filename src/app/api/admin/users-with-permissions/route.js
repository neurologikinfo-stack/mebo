import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ service role
);

export async function GET() {
  try {
    // Traer usuarios con permisos relacionados
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        clerk_id,
        full_name,
        email,
        role,
        user_permissions (
          permission_id,
          permissions (
            id,
            name
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 🔹 Transformamos para que sea más fácil en el frontend
    const formatted = data.map((u) => ({
      id: u.id,
      clerk_id: u.clerk_id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      permissions: u.user_permissions?.map((up) => up.permissions.name) || [],
    }));

    return NextResponse.json({ ok: true, data: formatted });
  } catch (err) {
    console.error("❌ Error en GET /api/admin/users-with-permissions:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
