import { supabaseServer } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// DELETE /api/admin/businesses/:id
export async function DELETE(req, { params }) {
  const { id } = params;
  const supabase = supabaseServer();

  const { error } = await supabase
    .from("businesses")
    .update({ deleted_at: new Date().toISOString() }) // soft delete
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/businesses/:id
export async function PATCH(req, { params }) {
  const { id } = params;
  const supabase = supabaseServer();

  const { error } = await supabase
    .from("businesses")
    .update({ deleted_at: null }) // restore
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
