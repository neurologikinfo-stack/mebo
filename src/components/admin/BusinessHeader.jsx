'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BusinessHeader() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard/admin/business', label: 'Listado' },
    { href: '/dashboard/admin/business/new', label: 'Nuevo negocio' },
  ]

  return (
    <header className="mb-6 border-b pb-4">
      {/* Título */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Negocios</h1>
        <p className="text-sm text-gray-600">Administra todos los negocios desde este panel.</p>
      </div>

      {/* Navegación */}
      <nav className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded transition ${
              pathname === item.href
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
