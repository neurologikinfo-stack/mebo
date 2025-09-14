import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service role (bypassa RLS)
);

// 🔹 GET: obtener un perfil
export async function GET(req, { params }) {
  try {
    if (!params?.clerk_id) {
      return NextResponse.json(
        { ok: false, error: "Falta clerk_id" },
        { status: 400 }
      );
    }

    const decodedClerkId = decodeURIComponent(params.clerk_id);

    const { data, error } = await supabase.rpc("admin_get_profile", {
      clerk_id_input: decodedClerkId,
    });

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("❌ Error en GET /api/admin/users/[clerk_id]:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

// 🔹 PATCH: actualizar un perfil y permisos
export async function PATCH(req, { params }) {
  try {
    if (!params?.clerk_id) {
      return NextResponse.json(
        { ok: false, error: "Falta clerk_id" },
        { status: 400 }
      );
    }

    const decodedClerkId = decodeURIComponent(params.clerk_id);
    const updates = await req.json();

    // --- 1. Actualizar datos del perfil (si existen en body)
    let profileData = null;
    if (
      updates.full_name ||
      updates.email ||
      updates.role ||
      updates.phone ||
      updates.avatar_url
    ) {
      const { data, error } = await supabase.rpc("admin_update_profile", {
        clerk_id_input: decodedClerkId,
        updates,
      });
      if (error) throw error;
      profileData = data;
    }

    // --- 2. Actualizar permisos si vienen en el body
    if (Array.isArray(updates.permissions)) {
      // obtener profile_id
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_id", decodedClerkId)
        .maybeSingle();

      if (userError) throw userError;
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      // limpiar permisos actuales
      const { error: delError } = await supabase
        .from("user_permissions")
        .delete()
        .eq("profile_id", user.id);
      if (delError) throw delError;

      // mapear nombres a IDs
      const { data: perms, error: permError } = await supabase
        .from("permissions")
        .select("id, name")
        .in("name", updates.permissions);

      if (permError) throw permError;

      const rows = perms.map((p) => ({
        profile_id: user.id,
        permission_id: p.id,
      }));

      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from("user_permissions")
          .insert(rows);
        if (insertError) throw insertError;
      }
    }

    return NextResponse.json({ ok: true, data: profileData });
  } catch (err) {
    console.error(
      "❌ Error en PATCH /api/admin/users/[clerk_id]:",
      err.message
    );
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
