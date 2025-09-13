import { supabaseServer } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminHomePage() {
  const supabase = supabaseServer();

  // ✅ KPIs
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: businessCount } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true });

  // ✅ Últimos 5 usuarios
  const { data: latestUsers } = await supabase
    .from("profiles")
    .select("clerk_id, full_name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // ✅ Últimos 5 negocios
  const { data: latestBusinesses } = await supabase
    .from("businesses")
    .select("id, name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-xl shadow border border-border">
          <h2 className="text-sm text-muted-foreground">Usuarios</h2>
          <p className="text-2xl font-semibold">{usersCount || 0}</p>
        </div>
        <div className="p-6 bg-card rounded-xl shadow border border-border">
          <h2 className="text-sm text-muted-foreground">Negocios</h2>
          <p className="text-2xl font-semibold">{businessCount || 0}</p>
        </div>
      </div>

      {/* Últimos usuarios */}
      <div className="p-6 bg-card rounded-xl shadow border border-border">
        <h2 className="text-lg font-semibold mb-4">Últimos usuarios</h2>
        <ul className="divide-y divide-border">
          {latestUsers?.map((u) => (
            <li
              key={u.clerk_id}
              className="py-2 px-3 hover:bg-muted/50 cursor-pointer flex justify-between"
            >
              <Link
                href={`/dashboard/admin/users/${u.clerk_id}`}
                className="w-full flex justify-between"
              >
                <span>{u.full_name || "Sin nombre"}</span>
                <span className="text-sm text-muted-foreground">{u.email}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard/admin/users"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Ver todos →
        </Link>
      </div>

      {/* Últimos negocios */}
      <div className="p-6 bg-card rounded-xl shadow border border-border">
        <h2 className="text-lg font-semibold mb-4">Últimos negocios</h2>
        <ul className="divide-y divide-border">
          {latestBusinesses?.map((b) => (
            <li
              key={b.id}
              className="py-2 px-3 hover:bg-muted/50 cursor-pointer flex justify-between"
            >
              <Link
                href={`/dashboard/admin/business/${b.id}`}
                className="w-full flex justify-between"
              >
                <span>{b.name}</span>
                <span className="text-sm text-muted-foreground">
                  {b.email || "Sin email"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard/admin/business"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Ver todos →
        </Link>
      </div>
    </div>
  );
}
