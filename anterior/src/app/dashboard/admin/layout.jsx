"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Usuarios", href: "/dashboard/admin/users", icon: Users },
  { name: "Negocios", href: "/dashboard/admin/business", icon: Briefcase },
  { name: "Reportes", href: "/dashboard/admin/reports", icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } flex-shrink-0 bg-white border-r border-gray-200 shadow-sm transition-all duration-300 fixed md:static inset-y-0 left-0 z-30`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <h2 className="text-lg font-bold text-gray-800">Panel Admin</h2>
          )}
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menú */}
        <nav className="px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main con Navbar superior */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-20 w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            <h1 className="text-lg font-semibold text-gray-800">
              Dashboard Admin
            </h1>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Buscar..."
                className="hidden md:block rounded-lg border px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              />
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
