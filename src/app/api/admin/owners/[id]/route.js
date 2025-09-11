import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";

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
    const { full_name, email } = body;

    if (!id)
      return NextResponse.json(
        { ok: false, error: "Falta ID" },
        { status: 400 }
      );

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("owners")
      .update({ full_name, email })
      .eq("id", id)
      .select()
      .single();

    if (error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );

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
    if (!id)
      return NextResponse.json(
        { ok: false, error: "Falta ID" },
        { status: 400 }
      );

    const supabase = supabaseServer();
    const { error } = await supabase.from("owners").delete().eq("id", id);

    if (error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
