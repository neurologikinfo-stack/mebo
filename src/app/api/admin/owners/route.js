import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

/**
 * GET /api/admin/owners
 * Devuelve todos los owners en Supabase
 */
export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("owners")
      .select("id, full_name, email, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error cargando owners:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("❌ Excepción en GET /owners:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/owners
 * Crea una invitación en Clerk y la guarda en Supabase
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
    console.log("📥 Body recibido en /owners:", JSON.stringify(body, null, 2));

    const { full_name, email } = body;

    if (!full_name || !email) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios (full_name, email)" },
        { status: 400 }
      );
    }

    // 🌍 redirect_url con fallback seguro
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/dashboard/owner`;

    // Crear invitación en Clerk
    let invitation;
    try {
      invitation = await clerkClient.invitations.createInvitation({
        email_address: email.trim(),
        redirect_url: redirectUrl,
        public_metadata: {
          role: "owner",
        },
      });
      console.log("✅ Invitación creada en Clerk:", invitation.id);
    } catch (clerkErr) {
      console.error(
        "❌ Error creando invitación en Clerk:",
        JSON.stringify(clerkErr, null, 2)
      );
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

    // Guardar en Supabase como pending
    try {
      const supabase = supabaseServer();
      const { data, error } = await supabase
        .from("owners")
        .insert([
          {
            full_name,
            email,
            clerk_invitation_id: invitation.id,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error insertando owner en Supabase:", error);
        return NextResponse.json(
          { ok: false, error: "Error en Supabase", details: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        data,
        invitationUrl: invitation.url, // 👈 devolvemos el link de invitación
      });
    } catch (dbErr) {
      console.error("❌ Excepción al insertar en Supabase:", dbErr);
      return NextResponse.json(
        {
          ok: false,
          error: "Error inesperado en Supabase",
          details: dbErr.message,
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("❌ Error en POST /owners:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * Otros métodos no soportados
 */
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
