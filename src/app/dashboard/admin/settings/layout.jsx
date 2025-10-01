'use client'

import { usePathname } from 'next/navigation'
import { adminTabs } from './tabs'

export default function AdminSettingsLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Configuración</h1>
      <p className="text-muted-foreground">Administra tu sidebar y preferencias.</p>

      {/* 🔹 Tabs */}
      <nav className="flex gap-4 border-b border-border mb-4">
        {adminTabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <a
              key={tab.href}
              href={tab.href}
              className={`px-3 py-2 border-b-2 ${
                isActive
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-foreground hover:text-primary'
              }`}
            >
              {tab.name}
            </a>
          )
        })}
      </nav>

      <div>{children}</div>
    </div>
  )
}
