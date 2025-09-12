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

    // 🔎 Validaciones iniciales
    if (!full_name) {
      return NextResponse.json(
        { ok: false, error: "El campo full_name está vacío" },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { ok: false, error: "El campo email está vacío" },
        { status: 400 }
      );
    }
    if (!username) {
      return NextResponse.json(
        { ok: false, error: "El campo username está vacío" },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { ok: false, error: "El campo password está vacío" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9._]{3,15}$/.test(username)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El username solo puede contener letras, números, puntos o guiones bajos (3-15 caracteres).",
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

    // 📌 Debug extra
    console.log("👉 Datos a enviar a Clerk:", {
      email_addresses: [email],
      username,
      password,
      first_name: full_name,
    });

    // ✅ Crear usuario en Clerk
    let clerkUser;
    try {
      clerkUser = await clerkClient.users.createUser({
        email_addresses: [email],
        username,
        password,
        first_name: full_name,
        public_metadata: { role: "owner" },
      });
      console.log("🔍 Clerk user creado:", clerkUser.id);
    } catch (clerkErr) {
      console.error("❌ Error creando usuario en Clerk:", clerkErr);

      const code = clerkErr.errors?.[0]?.code;
      const message = clerkErr.errors?.[0]?.message;

      if (code === "username_taken") {
        return NextResponse.json(
          { ok: false, error: "Ese username ya está en uso" },
          { status: 409 }
        );
      }

      if (code === "email_address_exists") {
        return NextResponse.json(
          { ok: false, error: "Ese email ya está registrado en Clerk" },
          { status: 409 }
        );
      }

      if (code === "form_password_invalid") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "La contraseña no cumple con la política de seguridad (mínimo 8 caracteres, mayúscula, minúscula y número según configuración).",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: "Error creando usuario en Clerk",
          details: message || clerkErr.message,
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

        if (error.code === "23505") {
          return NextResponse.json(
            {
              ok: false,
              error: "El email o clerk_id ya existe en la tabla owners",
            },
            { status: 409 }
          );
        }
        if (error.code === "23502") {
          return NextResponse.json(
            { ok: false, error: "Falta un campo obligatorio en owners" },
            { status: 400 }
          );
        }

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
