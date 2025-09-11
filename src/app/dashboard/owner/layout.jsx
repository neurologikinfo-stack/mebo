"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Home,
  DollarSign,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard/owner", icon: LayoutDashboard },
  { name: "Mis Negocios", href: "/dashboard/owner/businesses", icon: Home },
  { name: "Pagos", href: "/dashboard/owner/payments", icon: DollarSign },
];

export default function OwnerLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } fixed md:static inset-y-0 left-0 z-30 flex-shrink-0
        bg-card text-card-foreground border-r border-border shadow-sm
        transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <h2 className="text-lg font-bold">Panel Propietario</h2>
          )}
          <button
            className="p-2 rounded hover:bg-muted"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition
                  ${
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <header className="sticky top-0 z-20 w-full bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">Dashboard Propietario</h1>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
