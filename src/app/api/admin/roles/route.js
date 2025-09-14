export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔑 Service role (bypassa RLS)
);

// GET: listar roles + permisos
export async function GET() {
  try {
    const { data: roles, error } = await supabase.from("roles").select(`
        id,
        name,
        role_permissions (
          permission_id,
          permissions ( name )
        )
      `);

    if (error) throw error;

    // Normalizar salida → roles con lista de nombres de permisos
    const formatted = roles.map((r) => ({
      id: r.id,
      name: r.name,
      permissions: r.role_permissions.map((rp) => rp.permissions.name),
    }));

    return NextResponse.json({ ok: true, data: formatted });
  } catch (err) {
    console.error("❌ Error en GET /api/admin/roles:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
