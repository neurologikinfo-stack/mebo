import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

export async function GET(req, { params }) {
  try {
    if (!params?.clerk_id) {
      return NextResponse.json(
        { ok: false, error: "Falta clerk_id" },
        { status: 400 }
      );
    }

    const rawClerkId = params.clerk_id;
    const decodedClerkId = decodeURIComponent(rawClerkId);

    // 🔎 Logs para depuración
    console.log("👉 Param recibido:", rawClerkId);
    console.log("👉 Decodificado:", decodedClerkId);

    // Traemos algunos clerk_id de la DB para comparar
    const { data: debug } = await supabaseServer()
      .from("profiles")
      .select("clerk_id")
      .limit(10);

    console.log("👉 Clerk IDs en DB:", debug);

    // Query normal con eq
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, clerk_id, full_name, email, phone, role, avatar_url, created_at, updated_at"
      )
      .eq("clerk_id", decodedClerkId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: "Usuario no encontrado",
          debug: { rawClerkId, decodedClerkId },
        },
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
