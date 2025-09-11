import { supabaseServer } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET /api/admin/businesses
export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, email, phone, logo_url, deleted_at, address, city, province, country"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, data });
}
