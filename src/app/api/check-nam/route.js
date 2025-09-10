import { supabaseServer } from "@/utils/supabase/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return new Response(JSON.stringify({ available: false }), { status: 400 });
  }

  const supabase = supabaseServer();

  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  return new Response(JSON.stringify({ available: !data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
