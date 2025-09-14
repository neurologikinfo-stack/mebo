import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

/**
 * GET /api/admin/owners
 * Devuelve todos los owners y agrega avatar desde profiles.clerk_id
 */
export async function GET() {
  try {
    const supabase = supabaseServer();

    // 1. Traer owners
    const { data: owners, error } = await supabase
      .from("owners")
      .select("id, clerk_id, full_name, email, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!owners || owners.length === 0) {
      return NextResponse.json({ ok: true, data: [] });
    }

    // 2. Buscar los avatars en profiles
    const clerkIds = owners.map((o) => o.clerk_id).filter(Boolean);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("clerk_id, avatar_url")
      .in("clerk_id", clerkIds);

    if (profilesError) throw profilesError;

    // 3. Crear un mapa clerk_id -> avatar_url
    const profilesMap = Object.fromEntries(
      (profiles || []).map((p) => [p.clerk_id, p.avatar_url])
    );

    // 4. Enriquecer owners con avatar_url
    const enrichedOwners = owners.map((o) => ({
      ...o,
      avatar_url: profilesMap[o.clerk_id] || null,
    }));

    return NextResponse.json({ ok: true, data: enrichedOwners });
  } catch (err) {
    console.error("❌ Error en GET /owners:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/owners
 * Crea invitación en Clerk y la guarda en Supabase
 */
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { full_name, email } = body;

    if (!full_name || !email) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios (full_name, email)" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/dashboard/owner`;

    // Crear invitación en Clerk
    let invitation;
    try {
      invitation = await clerkClient.invitations.createInvitation({
        email_address: email.trim(),
        redirect_url: redirectUrl,
        public_metadata: { role: "owner" },
      });
    } catch (clerkErr) {
      const message =
        clerkErr.errors?.map((e) => e.message).join(", ") ||
        clerkErr.message ||
        "Request body invalid";
      return NextResponse.json(
        {
          ok: false,
          error: "Error creando invitación en Clerk",
          details: message,
        },
        { status: 400 }
      );
    }

    if (!invitation?.id) {
      return NextResponse.json(
        { ok: false, error: "Clerk no devolvió un ID válido" },
        { status: 500 }
      );
    }

    // Guardar en Supabase
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("owners")
      .insert([
        {
          full_name,
          email,
          clerk_id: null, // 🔹 se llenará cuando acepte la invitación
          clerk_invitation_id: invitation.id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Error en Supabase", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
      invitationUrl: invitation.url,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { ok: false, error: "Method Not Allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { ok: false, error: "Method Not Allowed" },
    { status: 405 }
  );
}
