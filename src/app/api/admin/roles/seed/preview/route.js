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

    // Helper para agrupar permisos por recurso
    function groupByResource(perms) {
      return perms.reduce((acc, perm) => {
        const [resource, action] = perm.split(".");
        if (!acc[resource]) acc[resource] = {};
        acc[resource][action] = true;
        return acc;
      }, {});
    }

    // 🔹 Roles base
    const roles = ["admin", "owner", "staff", "customer"];
    const assignments = {};

    // Admin → todos los permisos
    const adminPerms = allPermissions.map((p) => p.name);
    assignments.admin = {
      flat: adminPerms,
      grouped: groupByResource(adminPerms),
    };

    // Owner
    const ownerPerms = [
      "businesses.view",
      "businesses.edit",
      "owners.view",
      "owners.edit",
      "reports.view",
    ].filter((p) => allPermissions.some((ap) => ap.name === p));
    assignments.owner = {
      flat: ownerPerms,
      grouped: groupByResource(ownerPerms),
    };

    // Staff
    const staffPerms = [
      "businesses.create",
      "businesses.view",
      "owners.view",
      "reports.view",
    ].filter((p) => allPermissions.some((ap) => ap.name === p));
    assignments.staff = {
      flat: staffPerms,
      grouped: groupByResource(staffPerms),
    };

    // Customer
    const customerPerms = ["businesses.view", "owners.view"].filter((p) =>
      allPermissions.some((ap) => ap.name === p)
    );
    assignments.customer = {
      flat: customerPerms,
      grouped: groupByResource(customerPerms),
    };

    return NextResponse.json({
      ok: true,
      message: "Vista previa de asignaciones de roles (agrupadas)",
      data: {
        roles,
        assignments,
      },
    });
  } catch (err) {
    console.error("❌ Error en preview seed roles:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
