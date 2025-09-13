// /app/api/admin/profiles/[id]/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PATCH(req, { params }) {
  const body = await req.json();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: body.full_name,
      phone: body.phone,
      avatar_url: body.avatar_url,
    })
    .eq("id", params.id) // 👈 id del perfil, no el clerk_id
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, data });
}
