import { supabaseServer } from "@/utils/supabase/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const slug = searchParams.get("slug");

    if (!name && !slug) {
      return new Response(
        JSON.stringify({ ok: false, error: "Debes enviar name o slug" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = supabaseServer();
    let available = true;
    let type = "";

    if (name) {
      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("name", name.trim())
        .maybeSingle();

      available = !data;
      type = "name";
    }

    if (slug) {
      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", slug.trim())
        .maybeSingle();

      available = !data;
      type = "slug";
    }

    return new Response(JSON.stringify({ ok: true, type, available }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error en /api/check-nam:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
