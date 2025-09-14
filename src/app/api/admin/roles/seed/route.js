export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service role para saltar RLS
);

export async function POST() {
  try {
    // 🚨 limpiar antes (cuidado en producción)
    await supabase.from("role_permissions").delete().neq("id", 0);
    await supabase.from("roles").delete().neq("id", 0);

    // 1️⃣ Crear roles base
    const roles = ["admin", "owner", "staff", "customer"];
    const { data: insertedRoles, error: rolesError } = await supabase
      .from("roles")
      .insert(roles.map((name) => ({ name })))
      .select();

    if (rolesError) throw rolesError;

    // 2️⃣ Obtener todos los permisos
    const { data: allPermissions, error: permError } = await supabase
      .from("permissions")
      .select("id, name");

    if (permError) throw permError;

    // 3️⃣ Mapear permisos por rol
    const roleMap = Object.fromEntries(
      insertedRoles.map((r) => [r.name, r.id])
    );

    const assignments = [];

    // 🔹 Admin: todos los permisos
    allPermissions.forEach((p) => {
      assignments.push({
        role_id: roleMap["admin"],
        permission_id: p.id,
      });
    });

    // 🔹 Owner
    const ownerPerms = [
      "businesses.view",
      "businesses.edit",
      "owners.view",
      "owners.edit",
      "reports.view",
    ];
    allPermissions
      .filter((p) => ownerPerms.includes(p.name))
      .forEach((p) =>
        assignments.push({ role_id: roleMap["owner"], permission_id: p.id })
      );

    // 🔹 Staff
    const staffPerms = [
      "businesses.create",
      "businesses.view",
      "owners.view",
      "reports.view",
    ];
    allPermissions
      .filter((p) => staffPerms.includes(p.name))
      .forEach((p) =>
        assignments.push({ role_id: roleMap["staff"], permission_id: p.id })
      );

    // 🔹 Customer
    const customerPerms = ["businesses.view", "owners.view"];
    allPermissions
      .filter((p) => customerPerms.includes(p.name))
      .forEach((p) =>
        assignments.push({
          role_id: roleMap["customer"],
          permission_id: p.id,
        })
      );

    // 4️⃣ Insertar role_permissions
    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(assignments);

    if (insertError) throw insertError;

    return NextResponse.json({
      ok: true,
      message: "Roles y permisos asignados correctamente 🚀",
      data: { roles: insertedRoles.length, assignments: assignments.length },
    });
  } catch (err) {
    console.error("❌ Error en seed roles:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
