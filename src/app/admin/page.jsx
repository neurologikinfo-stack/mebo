import { supabaseServer } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminHomePage() {
  const supabase = supabaseServer();

  // KPIs
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: businessCount } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true });

  // Últimos 5 usuarios
  const { data: latestUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Últimos 5 negocios
  const { data: latestBusinesses } = await supabase
    .from("businesses")
    .select("id, name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Panel de Administración
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-sm font-medium text-gray-500">Usuarios</h2>
          <p className="text-2xl font-semibold">{usersCount || 0}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-sm font-medium text-gray-500">Negocios</h2>
          <p className="text-2xl font-semibold">{businessCount || 0}</p>
        </div>
      </div>

      {/* Últimos usuarios */}
      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Últimos usuarios</h2>
        <ul className="divide-y divide-gray-200">
          {latestUsers?.map((u) => (
            <li key={u.id} className="py-2 flex justify-between">
              <span>{u.full_name || "Sin nombre"}</span>
              <span className="text-gray-500 text-sm">{u.email}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/users"
          className="mt-3 inline-block text-blue-600 text-sm hover:underline"
        >
          Ver todos →
        </Link>
      </div>

      {/* Últimos negocios */}
      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Últimos negocios</h2>
        <ul className="divide-y divide-gray-200">
          {latestBusinesses?.map((b) => (
            <li key={b.id} className="py-2 flex justify-between">
              <span>{b.name}</span>
              <span className="text-gray-500 text-sm">
                {b.email || "Sin email"}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/business"
          className="mt-3 inline-block text-blue-600 text-sm hover:underline"
        >
          Ver todos →
        </Link>
      </div>
    </div>
  );
}
