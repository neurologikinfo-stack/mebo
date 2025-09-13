import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";

// ==========================
// GET: obtener un owner por ID
// ==========================
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Falta ID" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("owners")
      .select("id, full_name, email, status, avatar_url, phone, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Owner no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

// ==========================
// PATCH: actualizar owner
// ==========================
export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { full_name, email, status, avatar_url, phone } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Falta ID" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("owners")
      .update({
        full_name,
        email,
        status,
        avatar_url,
        phone,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

// ==========================
// DELETE: eliminar owner
// ==========================
export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Falta ID" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { error } = await supabase.from("owners").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
