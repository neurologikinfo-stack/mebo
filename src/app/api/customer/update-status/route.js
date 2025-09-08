import { supabaseServer } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { appointment_id, status } = await req.json();
    const supabase = supabaseServer();

    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointment_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
