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

// 🔹 PATCH: actualizar un perfil
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

    const { data, error } = await supabase.rpc("admin_update_profile", {
      clerk_id_input: decodedClerkId,
      updates,
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
