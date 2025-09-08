export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    console.log("🔎 Backfill iniciado");

    let inserted = 0;
    let errors = [];
    let nextPage = null;
    let allClerkIds = [];

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
      const clerkUsers = data.data || data;

      for (const user of clerkUsers) {
        allClerkIds.push(user.id);

        const email =
          user.email_addresses?.find(
            (e) => e.id === user.primary_email_address_id
          )?.email_address || null;

        const full_name =
          [user.first_name, user.last_name].filter(Boolean).join(" ") ||
          user.username ||
          null;

        const avatar_url = user.image_url ? `${user.image_url}?size=256` : null;

        // 🚫 No usar role de Clerk nunca
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("clerk_id", user.id)
          .maybeSingle();

        const role = existingProfile?.role || "user";

        const { error } = await supabase.from("profiles").upsert(
          {
            clerk_id: user.id,
            email,
            full_name,
            avatar_url,
            role, // siempre conservar Supabase
            updated_at: new Date().toISOString(),
          },
          { onConflict: "clerk_id" }
        );

        if (error) {
          console.error("❌ Error insertando perfil:", error.message);
          errors.push({ email, error: error.message });
        } else {
          console.log(`✅ Sincronizado: ${email} (${role})`);
          inserted++;
        }
      }

      nextPage = data.meta?.next_page_token || null;
    } while (nextPage);

    // 🔍 Buscar huérfanos
    const { data: existingProfiles, error: fetchErr } = await supabase
      .from("profiles")
      .select("clerk_id");

    if (!fetchErr) {
      const orphanIds = existingProfiles
        .map((p) => p.clerk_id)
        .filter((id) => !allClerkIds.includes(id));

      if (orphanIds.length > 0) {
        const { error: delErr } = await supabase
          .from("profiles")
          .delete()
          .in("clerk_id", orphanIds);

        if (delErr) {
          console.error("❌ Error eliminando huérfanos:", delErr.message);
        } else {
          console.log(`🧹 Eliminados ${orphanIds.length} perfiles huérfanos`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ ${inserted} usuarios sincronizados`,
      errors,
    });
  } catch (err) {
    console.error("❌ Error en backfill:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
