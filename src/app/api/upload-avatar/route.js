import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 👈 service_role (ignora RLS)
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const clerk_id = formData.get("clerk_id");

    if (!file || !clerk_id) {
      return NextResponse.json(
        { ok: false, error: "Faltan parámetros" },
        { status: 400 }
      );
    }

    const filePath = `${clerk_id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (err) {
    console.error("❌ Error en upload-avatar:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
