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
    console.log("📥 Body recibido en /owners:", body);

    const { full_name, email, username, password } = body;

    // Validaciones iniciales
    if (!full_name || !email || !username || !password) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Faltan datos obligatorios (full_name, email, username, password)",
        },
        { status: 400 }
      );
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un caracter especial.",
        },
        { status: 400 }
      );
    }

    // 🛠 Normalizar username a minúsculas
    const normalizedUsername = username.toLowerCase();

    // 🛠 Separar nombre y apellido
    const [firstName, ...lastNameParts] = full_name.trim().split(" ");
    const lastName = lastNameParts.join(" ") || null;

    console.log("🕵️ Datos a enviar a Clerk:", {
      email,
      username: normalizedUsername,
      password,
      first_name: firstName,
      last_name: lastName,
      email_verified: true, // 👈 ya marcamos el correo como verificado
    });

    // ✅ Crear usuario en Clerk con email verificado
    let clerkUser;
    try {
      clerkUser = await clerkClient.users.createUser({
        email_address: email,
        username: normalizedUsername,
        password,
        first_name: firstName,
        last_name: lastName,
        email_verified: true, // 👈 Esto evita el modal de verificación
        public_metadata: { role: "owner" },
      });
      console.log("🔍 Clerk user creado:", clerkUser.id);
    } catch (clerkErr) {
      console.error("❌ Error creando usuario en Clerk:", clerkErr);

      const message = clerkErr.errors?.[0]?.message || clerkErr.message;

      return NextResponse.json(
        {
          ok: false,
          error: "Error creando usuario en Clerk",
          details: message,
        },
        { status: 400 }
      );
    }

    if (!clerkUser?.id) {
      return NextResponse.json(
        { ok: false, error: "Clerk no devolvió un ID válido" },
        { status: 500 }
      );
    }

    // ✅ Insertar en Supabase
    try {
      const supabase = supabaseServer();
      const { data, error } = await supabase
        .from("owners")
        .insert([{ full_name, email, clerk_id: clerkUser.id }])
        .select()
        .single();

      if (error) {
        console.error("❌ Error insertando owner en Supabase:", error);
        return NextResponse.json(
          { ok: false, error: "Error en Supabase", details: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ ok: true, data });
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
