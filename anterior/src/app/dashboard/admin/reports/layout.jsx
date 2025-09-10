"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ReportsLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard/admin/reports", label: "Estadísticas" },
    { href: "/dashboard/admin/reports/finance", label: "Finanzas" },
    { href: "/dashboard/admin/reports/activity", label: "Actividad" },
  ];

  return (
    <div className="w-full">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
        <p className="text-sm text-gray-600">
          Consulta métricas y datos del sistema.
        </p>

        <nav className="mt-4 flex gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 rounded ${
                pathname === item.href
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div>{children}</div>
    </div>
  );
}
