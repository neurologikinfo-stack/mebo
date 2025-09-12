import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

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

    // Crear invitación en Clerk
    let invitation;
    try {
      invitation = await clerkClient.invitations.createInvitation({
        email_address: email.trim(),
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
        { ok: false, error: "Clerk no devolvió un ID de invitación válido" },
        { status: 500 }
      );
    }

    // Guardamos en Supabase como pendiente
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
        invitationUrl: invitation.url, // 👈 ahora devolvemos el link
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
      {
        ok: false,
        error: "Error inesperado en servidor",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
