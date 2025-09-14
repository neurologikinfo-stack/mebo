export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔹 GET: vista previa de asignaciones de roles
export async function GET() {
  try {
    // 🔹 Permisos actuales en DB
    const { data: allPermissions, error: permError } = await supabase
      .from("permissions")
      .select("id, name");

    if (permError) throw permError;

    // 🔹 Roles base
    const roles = ["admin", "owner", "staff", "customer"];

    const assignments = {};

    // Admin → todos los permisos
    assignments.admin = allPermissions.map((p) => p.name);

    // Owner
    assignments.owner = [
      "businesses.view",
      "businesses.edit",
      "owners.view",
      "owners.edit",
      "reports.view",
    ].filter((p) => allPermissions.some((ap) => ap.name === p));

    // Staff
    assignments.staff = [
      "businesses.create",
      "businesses.view",
      "owners.view",
      "reports.view",
    ].filter((p) => allPermissions.some((ap) => ap.name === p));

    // Customer
    assignments.customer = ["businesses.view", "owners.view"].filter((p) =>
      allPermissions.some((ap) => ap.name === p)
    );

    return NextResponse.json({
      ok: true,
      message: "Vista previa de asignaciones de roles",
      data: roles.map((r) => ({
        name: r,
        permissions: assignments[r] || [],
      })),
    });
  } catch (err) {
    console.error("❌ Error en GET /api/admin/roles/seed/preview:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
