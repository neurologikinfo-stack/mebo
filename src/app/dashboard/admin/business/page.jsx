import { supabaseServer } from "@/utils/supabase/server";
import Link from "next/link";

export default async function BusinessListPage() {
  const supabase = supabaseServer();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, slug, email, phone, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Error: {error.message}</p>;
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border shadow">
        <p className="text-gray-600">No hay negocios registrados todavía.</p>
        <Link
          href="/dashboard/admin/business/new"
          className="mt-4 inline-block rounded bg-blue-600 text-white px-4 py-2 text-sm"
        >
          Crear negocio
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">
          Negocios
        </h1>
        <span className="text-sm text-gray-500">
          Total: {businesses.length} negocios
        </span>
      </div>

      {/* Tabla compacta */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{b.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">@{b.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {b.email || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {b.phone || "—"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link
                    href={`/dashboard/admin/business/${b.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver
                  </Link>{" "}
                  |{" "}
                  <Link
                    href={`/dashboard/admin/business/${b.id}/edit`}
                    className="text-gray-600 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
