import { supabaseServer } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminHomePage() {
  const supabase = supabaseServer()

  // ✅ KPIs
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: businessCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  // ✅ Últimos 5 usuarios con avatar, permisos y rol
  const { data: latestUsers } = await supabase
    .from('profiles')
    .select(
      `
      clerk_id,
      full_name,
      email,
      avatar_url,
      created_at,
      role,
      user_permissions (
        permissions (name)
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(5)

  // ✅ Últimos 5 negocios con logo
  const { data: latestBusinesses } = await supabase
    .from('businesses')
    .select('id, name, email, logo_url, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

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
              className="py-2 px-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
            >
              <Link
                href={`/dashboard/admin/users/${u.clerk_id}`}
                className="w-full flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar_url || '/default-avatar.png'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <div>
                    <span>{u.full_name || 'Sin nombre'}</span>
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {(u.user_permissions || []).map((up) => up.permissions?.name).join(', ') ||
                        u.role ||
                        'Sin rol'}
                    </span>
                  </div>
                </div>
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
              className="py-2 px-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
            >
              <Link
                href={`/dashboard/admin/business/${b.id}`}
                className="w-full flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={b.logo_url || '/default-business.png'}
                    alt="Logo"
                    className="w-8 h-8 rounded object-cover border"
                  />
                  <span>{b.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{b.email || 'Sin email'}</span>
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
  )
}
