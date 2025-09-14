import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ usa service role para bypass RLS
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("permissions")
      .select("id, name, description");

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("❌ Error en GET /api/admin/permissions:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
