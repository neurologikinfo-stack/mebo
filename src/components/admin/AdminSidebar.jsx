'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  User,
  Settings,
  Shield,
  UserCog,
  LockKeyhole,
  X,
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/dashboard/admin/users', icon: Users },
  { name: 'Roles', href: '/dashboard/admin/roles', icon: LockKeyhole },
  { name: 'Negocios', href: '/dashboard/admin/business', icon: Briefcase },
  { name: 'Owners', href: '/dashboard/admin/owners', icon: UserCog },
  { name: 'Permisos', href: '/dashboard/admin/permissions', icon: Shield },
  { name: 'Reportes', href: '/dashboard/admin/reports', icon: BarChart3 },
  { name: 'Perfil', href: '/dashboard/admin/profile', icon: User },
  { name: 'Configuración', href: '/dashboard/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Botón menú visible solo en móviles */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-primary text-primary-foreground shadow"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay en móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-40 w-64 bg-card text-card-foreground border-r border-border shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">Panel Admin</h2>
              <button className="p-2 rounded hover:bg-muted" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="px-2 py-4 space-y-1">
              {menuItems.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Sidebar en desktop */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } hidden md:flex flex-col flex-shrink-0 bg-card text-card-foreground border-r border-border shadow-sm transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && <h2 className="text-lg font-bold">Panel Admin</h2>}
          <button className="p-2 rounded hover:bg-muted" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="px-2 py-4 space-y-1 flex-1">
          {menuItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
