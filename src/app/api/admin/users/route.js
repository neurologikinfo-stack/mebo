export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerk_id");

    // 🔹 Si se pasa clerk_id -> buscar usuario específico
    if (clerkId) {
      const clerkIdNoPrefix = clerkId.replace(/^user_/, "");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, clerk_id, email, full_name, role, created_at, updated_at")
        .or(`clerk_id.eq.${clerkId},clerk_id.eq.${clerkIdNoPrefix}`)
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json({ success: true, user: data });
    }

    // 🔹 Si no se pasa clerk_id -> listar todos
    const { data, error } = await supabase
      .from("profiles")
      .select("id, clerk_id, email, full_name, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, users: data });
  } catch (err) {
    console.error("❌ Error en /api/admin/users:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
