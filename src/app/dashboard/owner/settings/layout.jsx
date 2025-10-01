'use client'

import { ownerTabs } from './tabs'

export default function OwnerSettingsLayout({ children }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <p className="text-muted-foreground">Configura tu perfil y preferencias.</p>

      {/* Tabs solo de Owner */}
      <nav className="flex gap-4 border-b border-border mb-4">
        {ownerTabs.map((tab) => (
          <a key={tab.href} href={tab.href} className="px-3 py-2 hover:text-primary">
            {tab.name}
          </a>
        ))}
      </nav>

      <div>{children}</div>
    </div>
  )
}
