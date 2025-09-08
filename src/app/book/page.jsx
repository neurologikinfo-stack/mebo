import { supabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function BookIndexPage() {
  // ✅ Validar sesión
  const { userId } = await auth();
  if (!userId) {
    // Redirige al login y luego vuelve a /book
    redirect(`/sign-in?redirect_url=/book`);
  }

  const supabase = supabaseServer();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, slug, description")
    .order("created_at", { ascending: true });

  if (error) {
    return <p className="text-red-600">Error: {error.message}</p>;
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Agendar</h1>
        <p className="text-gray-600 mt-2">No hay negocios disponibles.</p>
      </div>
    );
  }

  // ✅ si hay solo 1 negocio, redirigir directo a su página
  if (businesses.length === 1) {
    redirect(`/${businesses[0].slug}/book`);
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Selecciona un negocio</h1>
      <p className="text-gray-600">
        Elige con qué negocio deseas agendar una cita o tour.
      </p>

      <div className="space-y-4">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-gray-800">{b.name}</h2>
            <p className="text-sm text-gray-600">{b.description || "—"}</p>
            <Link
              href={`/${b.slug}/book`}
              className="mt-3 inline-block rounded bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500"
            >
              Agendar aquí
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
