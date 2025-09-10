import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { appointment_id, status } = body;

    if (!appointment_id || !status) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointment_id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
