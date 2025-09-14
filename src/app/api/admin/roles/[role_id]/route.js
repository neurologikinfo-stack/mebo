export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔹 GET: obtener un rol con sus permisos
export async function GET(req, { params }) {
  try {
    if (!params?.role_id) {
      return NextResponse.json(
        { ok: false, error: "Falta role_id" },
        { status: 400 }
      );
    }

    const decodedRoleId = decodeURIComponent(params.role_id);

    const { data: role, error } = await supabase
      .from("roles")
      .select(
        `
        id,
        name,
        role_permissions (
          permission_id,
          permissions ( name )
        )
      `
      )
      .eq("id", decodedRoleId)
      .maybeSingle();

    if (error) throw error;
    if (!role) {
      return NextResponse.json(
        { ok: false, error: "Rol no encontrado" },
        { status: 404 }
      );
    }

    const formatted = {
      id: role.id,
      name: role.name,
      permissions: role.role_permissions.map((rp) => rp.permissions.name),
    };

    return NextResponse.json({ ok: true, data: formatted });
  } catch (err) {
    console.error("❌ Error en GET /api/admin/roles/[role_id]:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

// 🔹 PATCH: actualizar permisos de un rol
export async function PATCH(req, { params }) {
  try {
    if (!params?.role_id) {
      return NextResponse.json(
        { ok: false, error: "Falta role_id" },
        { status: 400 }
      );
    }

    const decodedRoleId = decodeURIComponent(params.role_id);
    const body = await req.json();

    if (!Array.isArray(body.permissions)) {
      return NextResponse.json(
        { ok: false, error: "Debes enviar un array de permisos" },
        { status: 400 }
      );
    }

    // 1️⃣ Verificar si el rol existe
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("id", decodedRoleId)
      .maybeSingle();

    if (roleError) throw roleError;
    if (!role) {
      return NextResponse.json(
        { ok: false, error: "Rol no encontrado" },
        { status: 404 }
      );
    }

    // 2️⃣ Borrar permisos actuales
    const { error: delError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", decodedRoleId);

    if (delError) throw delError;

    // 3️⃣ Obtener IDs de los permisos enviados
    const { data: perms, error: permError } = await supabase
      .from("permissions")
      .select("id, name")
      .in("name", body.permissions);

    if (permError) throw permError;

    // 4️⃣ Insertar los nuevos permisos
    const rows = perms.map((p) => ({
      role_id: decodedRoleId,
      permission_id: p.id,
    }));

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("role_permissions")
        .insert(rows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      ok: true,
      message: "Permisos de rol actualizados correctamente",
      data: body.permissions,
    });
  } catch (err) {
    console.error("❌ Error en PATCH /api/admin/roles/[role_id]:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

// 🔹 DELETE: eliminar un rol
export async function DELETE(req, { params }) {
  try {
    if (!params?.role_id) {
      return NextResponse.json(
        { ok: false, error: "Falta role_id" },
        { status: 400 }
      );
    }

    const decodedRoleId = decodeURIComponent(params.role_id);

    // 1️⃣ Eliminar el rol (los permisos relacionados se borran con cascade si tu FK está configurada con ON DELETE CASCADE)
    const { error } = await supabase
      .from("roles")
      .delete()
      .eq("id", decodedRoleId);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      message: "Rol eliminado correctamente",
    });
  } catch (err) {
    console.error(
      "❌ Error en DELETE /api/admin/roles/[role_id]:",
      err.message
    );
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
