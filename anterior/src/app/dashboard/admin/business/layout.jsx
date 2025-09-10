"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BusinessesLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard/admin/business", label: "Listado" },
    { href: "/dashboard/admin/business/new", label: "Nuevo negocio" },
  ];

  return (
    <div className="w-full">
      {/* Encabezado de la sección Negocios */}
      <header className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Negocios</h1>
        <p className="text-sm text-gray-600">
          Administra todos los negocios desde este panel.
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

      {/* Contenido dinámico de la sección */}
      <div>{children}</div>
    </div>
  );
}
