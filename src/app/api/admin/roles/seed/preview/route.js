export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service role para saltar RLS
);

export async function GET() {
  try {
    // 🔹 Permisos actuales en DB
    const { data: allPermissions, error: permError } = await supabase
      .from("permissions")
      .select("id, name");

    if (permError) throw permError;

    // 🔹 Roles base
    const roles = ["admin", "owner", "staff", "customer"];
    const assignments = [];

    // Admin → todos los permisos
    assignments.push({
      name: "admin",
      permissions: allPermissions.map((p) => p.name),
    });

    // Owner
    assignments.push({
      name: "owner",
      permissions: [
        "businesses.view",
        "businesses.edit",
        "owners.view",
        "owners.edit",
        "reports.view",
      ].filter((p) => allPermissions.some((ap) => ap.name === p)),
    });

    // Staff
    assignments.push({
      name: "staff",
      permissions: [
        "businesses.create",
        "businesses.view",
        "owners.view",
        "reports.view",
      ].filter((p) => allPermissions.some((ap) => ap.name === p)),
    });

    // Customer
    assignments.push({
      name: "customer",
      permissions: ["businesses.view", "owners.view"].filter((p) =>
        allPermissions.some((ap) => ap.name === p)
      ),
    });

    return NextResponse.json({
      ok: true,
      message: "Vista previa de asignaciones de roles",
      data: assignments, // ✅ array [{name, permissions}]
    });
  } catch (err) {
    console.error("❌ Error en preview seed roles:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
