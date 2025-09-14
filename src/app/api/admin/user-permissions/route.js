import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔹 GET → lista permisos de un usuario por clerk_id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerk_id = searchParams.get("clerk_id");

    if (!clerk_id) {
      return NextResponse.json(
        { success: false, error: "Falta parámetro clerk_id" },
        { status: 400 }
      );
    }

    // 1. Buscar usuario
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", clerk_id)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 2. Buscar permisos asociados
    const { data: rows, error: permsError } = await supabase
      .from("user_permissions")
      .select("permissions(name)")
      .eq("profile_id", user.id);

    if (permsError) throw permsError;

    const permissions = rows.map((r) => r.permissions.name);

    return NextResponse.json({ success: true, permissions });
  } catch (err) {
    console.error("❌ Error en GET /api/admin/user-permissions:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// 🔹 POST → asignar o quitar permisos
export async function POST(req) {
  try {
    const body = await req.json();
    const { clerk_id, permission, grant } = body;

    if (!clerk_id || !permission) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros" },
        { status: 400 }
      );
    }

    // 1. Buscar usuario
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_id", clerk_id)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 2. Buscar permiso
    const { data: perm, error: permError } = await supabase
      .from("permissions")
      .select("id")
      .eq("name", permission)
      .maybeSingle();

    if (permError) throw permError;
    if (!perm) {
      return NextResponse.json(
        { success: false, error: "Permiso no encontrado" },
        { status: 404 }
      );
    }

    // 3. Insertar o borrar en user_permissions
    if (grant) {
      // ✅ upsert para evitar duplicados
      const { error: insertError } = await supabase
        .from("user_permissions")
        .upsert([{ profile_id: user.id, permission_id: perm.id }], {
          onConflict: "profile_id,permission_id",
        });

      if (insertError) throw insertError;
    } else {
      const { error: deleteError } = await supabase
        .from("user_permissions")
        .delete()
        .eq("profile_id", user.id)
        .eq("permission_id", perm.id);

      if (deleteError) throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error en POST /api/admin/user-permissions:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
