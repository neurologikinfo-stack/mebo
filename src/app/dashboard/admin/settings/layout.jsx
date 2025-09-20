'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { tabs, defaultTab } from './tabs'

export default function SettingsLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <p className="text-muted-foreground">Administra la configuración general del panel.</p>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => {
            const isRoot = pathname === '/dashboard/admin/settings'
            const active = (isRoot && tab.href === defaultTab) || pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  'pb-2 text-sm font-medium',
                  active
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  )
}
