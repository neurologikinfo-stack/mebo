export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    console.log("🔎 Verificando orphans...");

    // 1. Obtener todos los clerk_id en Supabase
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("id, clerk_id, email");

    if (profErr) throw new Error(profErr.message);

    // 2. Traer todos los usuarios desde Clerk (paginado)
    let clerkUsers = [];
    let nextPage = null;

    do {
      let url = "https://api.clerk.dev/v1/users?limit=100";
      if (nextPage) url += `&page_token=${nextPage}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.CLERK_API_KEY}` },
      });

      if (!res.ok) {
        throw new Error(`Clerk API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      clerkUsers.push(...(data.data || data));
      nextPage = data.meta?.next_page_token || null;
    } while (nextPage);

    const clerkIds = new Set(clerkUsers.map((u) => u.id));

    // 3. Comparar
    const orphans = profiles.filter(
      (p) => !p.clerk_id || !clerkIds.has(p.clerk_id)
    );

    console.log(`✅ Encontrados ${orphans.length} huérfanos`);

    return NextResponse.json({
      total_profiles: profiles.length,
      total_clerk: clerkUsers.length,
      orphan_count: orphans.length,
      orphans,
    });
  } catch (err) {
    console.error("❌ Error en check-orphans:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
