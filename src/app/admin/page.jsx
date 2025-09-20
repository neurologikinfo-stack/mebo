'use client'
import { useState } from 'react'
import Sidebar from '@/components/DashboardLayout'
import { Menu, Users, Briefcase, BarChart3, LayoutDashboard } from 'lucide-react'

const adminItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/dashboard/admin/users', icon: Users },
  { name: 'Negocios', href: '/dashboard/admin/business', icon: Briefcase },
  { name: 'Reportes', href: '/dashboard/admin/reports', icon: BarChart3 },
]

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        basePath="/dashboard/admin"
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        menuItems={adminItems}
      />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-20 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Dashboard Admin
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
