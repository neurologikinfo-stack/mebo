"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mis Citas", href: "/dashboard/appointments", icon: Calendar },
  { name: "Perfil", href: "/dashboard/profile", icon: User },
];

export default function CustomerLayout({ children }) {
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
            <h2 className="text-lg font-bold text-gray-800">Panel Cliente</h2>
          )}
          {/* Botón colapsar/expandir */}
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
        {/* Navbar */}
        <header className="sticky top-0 z-20 w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Botón menú en mobile */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            {/* Título */}
            <h1 className="text-lg font-semibold text-gray-800">
              Dashboard Cliente
            </h1>

            {/* Barra derecha: búsqueda / perfil */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Buscar..."
                className="hidden md:block rounded-lg border px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              />
              {/* Aquí puedes usar <UserButton /> de Clerk */}
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
