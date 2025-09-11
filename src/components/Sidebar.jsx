"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, User, X } from "lucide-react";

export default function Sidebar({
  basePath,
  collapsed,
  toggleCollapsed,
  menuItems,
}) {
  const pathname = usePathname();

  // Agregamos Profile y Settings por defecto
  const defaultItems = [
    { name: "Perfil", href: `${basePath}/profile`, icon: User },
    { name: "Configuración", href: `${basePath}/settings`, icon: Settings },
  ];

  const items = [...menuItems, ...defaultItems];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        bg-card text-card-foreground border-r border-border shadow-sm z-30`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && <h2 className="text-lg font-bold">Panel</h2>}
          <button
            className="p-2 rounded hover:bg-muted"
            onClick={toggleCollapsed}
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        <nav className="px-2 py-4 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon || LayoutDashboard;
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

      {/* Mobile Sidebar Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        onClick={toggleCollapsed}
      >
        <aside
          className={`absolute top-0 left-0 h-full w-64 bg-card text-card-foreground shadow-lg p-4 transition-transform duration-300 ${
            collapsed ? "-translate-x-full" : "translate-x-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h2 className="text-lg font-bold">Panel</h2>
            <button
              className="p-2 rounded hover:bg-muted"
              onClick={toggleCollapsed}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon || LayoutDashboard;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleCollapsed}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition
                    ${
                      active
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
