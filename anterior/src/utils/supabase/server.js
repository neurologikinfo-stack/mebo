import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("❌ Variables de entorno faltantes en supabaseServer()");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // 👈 usa el nombre correcto
  );
}
