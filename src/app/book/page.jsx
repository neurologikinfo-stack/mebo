import { supabaseServer } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";

export default async function BookIndexPage() {
  // ✅ Usuario actual (puede ser null si no hay sesión)
  const { userId } = await auth();

  const supabase = supabaseServer();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, slug, description, logo_url")
    .order("created_at", { ascending: true });

  if (error) {
    return <p className="text-red-600">Error: {error.message}</p>;
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Agendar</h1>
        <p className="text-gray-600 mt-2">No hay negocios disponibles.</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* Encabezado */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Selecciona un negocio
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Elige con qué negocio deseas agendar una cita o tour.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="group flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition overflow-hidden"
          >
            {/* Header con logo o inicial */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
              {b.logo_url ? (
                <Image
                  src={b.logo_url}
                  alt={b.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {b.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {b.name}
              </h2>
            </div>

            {/* Descripción */}
            <div className="flex-1 p-4 text-sm text-gray-600 dark:text-gray-300">
              {b.description || "Sin descripción disponible."}
            </div>

            {/* Footer con botón */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                href={
                  userId
                    ? `/${b.slug}/book`
                    : `/sign-in?redirect_url=/${b.slug}/book`
                }
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-500 transition"
              >
                <Calendar className="h-4 w-4" />
                {userId ? "Agendar" : "Inicia sesión para agendar"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
