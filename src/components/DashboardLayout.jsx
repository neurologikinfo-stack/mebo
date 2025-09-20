'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  Shield,
  UserCog,
  LockKeyhole,
  Settings,
  User,
  Calendar,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// 🔹 Menús por rol
const menuByRole = {
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/dashboard/admin/users', icon: Users },
    { name: 'Roles', href: '/dashboard/admin/roles', icon: LockKeyhole },
    { name: 'Negocios', href: '/dashboard/admin/business', icon: Briefcase },
    { name: 'Owners', href: '/dashboard/admin/owners', icon: UserCog },
    { name: 'Permisos', href: '/dashboard/admin/permissions', icon: Shield },
    { name: 'Reportes', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'Perfil', href: '/dashboard/admin/profile', icon: User },
    { name: 'Configuración', href: '/dashboard/admin/settings', icon: Settings },
  ],
  owner: [
    { name: 'Dashboard', href: '/dashboard/owner', icon: LayoutDashboard },
    { name: 'Mis Negocios', href: '/dashboard/owner/businesses', icon: Home },
    { name: 'Pagos', href: '/dashboard/owner/payments', icon: DollarSign },
    { name: 'Perfil', href: '/dashboard/owner/profile', icon: User },
    { name: 'Configuración', href: '/dashboard/owner/settings', icon: Settings },
  ],
  customer: [
    { name: 'Dashboard', href: '/dashboard/customer', icon: LayoutDashboard },
    { name: 'Mis Citas', href: '/dashboard/customer/appointments', icon: Calendar },
    { name: 'Perfil', href: '/dashboard/customer/profile', icon: User },
    { name: 'Configuración', href: '/dashboard/customer/settings', icon: Settings },
  ],
}

export default function DashboardLayout({ title, children }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useUser()
  const role = (user?.publicMetadata?.role || 'customer').toLowerCase()

  const menuItems = menuByRole[role] || []

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`
          ${collapsed ? 'w-20' : 'w-64'}
          h-screen fixed left-0 top-0 shadow-sm transition-all duration-300
          bg-primary text-primary-foreground
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && <h2 className="text-lg font-bold">{title}</h2>}
          <button
            className="p-2 rounded hover:bg-primary/20"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="py-4 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-md py-2 pl-4 pr-2 text-sm font-medium transition
                  ${active ? 'bg-black/20' : 'hover:bg-black/10'}
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Contenido */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? 80 : 256 }}
      >
        <header className="sticky top-0 z-20 w-full bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
