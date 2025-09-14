export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔹 POST: crear nuevo rol + asignar permisos
export async function POST(req) {
  try {
    const { name, permissions } = await req.json();

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Falta el nombre del rol" },
        { status: 400 }
      );
    }

    // 1️⃣ Crear rol
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .insert([{ name }])
      .select("id, name")
      .single();

    if (roleError) throw roleError;

    // 2️⃣ Si vienen permisos, obtener sus IDs
    if (Array.isArray(permissions) && permissions.length > 0) {
      const { data: perms, error: permError } = await supabase
        .from("permissions")
        .select("id, name")
        .in("name", permissions);

      if (permError) throw permError;

      // 3️⃣ Insertar relación en role_permissions
      const rows = perms.map((p) => ({
        role_id: role.id,
        permission_id: p.id,
      }));

      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from("role_permissions")
          .insert(rows);

        if (insertError) throw insertError;
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Rol creado correctamente",
      data: { ...role, permissions: permissions || [] },
    });
  } catch (err) {
    console.error("❌ Error en POST /api/admin/roles/create:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
