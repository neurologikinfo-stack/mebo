'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useSidebarColor } from '@/context/SidebarColorContext'

// 🔹 Colores predefinidos
const presetColors = {
  'preset:azul': { bg: '#2563eb', text: 'white' },
  'preset:rojo': { bg: '#dc2626', text: 'white' },
  'preset:amarillo': { bg: '#facc15', text: 'black' },
  'preset:verde': { bg: '#16a34a', text: 'white' },
  'preset:naranja': { bg: '#f97316', text: 'white' },
  'preset:gris': { bg: '#1f2937', text: 'white' },
  'preset:cian': { bg: '#06b6d4', text: 'black' },
  'preset:purpura': { bg: '#9333ea', text: 'white' },
  'preset:rosa': { bg: '#db2777', text: 'white' },
  'preset:negro': { bg: '#000000', text: 'white' },

  // 🔹 Especiales (respetan dark mode con clases)
  'preset:blanco': { className: 'bg-white text-black dark:bg-gray-900 dark:text-white' },
  'preset:oscuro': { className: 'bg-gray-900 text-white dark:bg-white dark:text-black' },
}

// 🔹 Función para calcular contraste automático (para hex personalizados)
function getContrastYIQ(hexcolor) {
  if (!hexcolor) return 'white'
  let c = hexcolor.replace('#', '')
  if (c.length === 3) {
    c = c
      .split('')
      .map((ch) => ch + ch)
      .join('')
  }
  const r = parseInt(c.substr(0, 2), 16)
  const g = parseInt(c.substr(2, 2), 16)
  const b = parseInt(c.substr(4, 2), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? 'black' : 'white'
}

export default function DashboardLayout({ title, menuItems = [], children }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { color } = useSidebarColor()

  // 🔹 Determinar estilos
  let bgColor,
    textColor,
    extraClass = ''

  if (presetColors[color]) {
    if (presetColors[color].bg) {
      bgColor = presetColors[color].bg
      textColor = presetColors[color].text
    }
    if (presetColors[color].className) {
      extraClass = presetColors[color].className
    }
  } else if (color?.startsWith('#')) {
    bgColor = color
    textColor = getContrastYIQ(color)
  } else {
    bgColor = '#1f2937'
    textColor = 'white'
  }

  // 🔹 Hover/active dinámico según contraste
  const hoverBg =
    textColor === 'white'
      ? 'rgba(255,255,255,0.2)' // fondos oscuros
      : 'rgba(0,0,0,0.1)' // fondos claros

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } h-screen fixed left-0 top-0 shadow-sm transition-all duration-300 ${extraClass}`}
        style={{
          backgroundColor: extraClass ? undefined : bgColor,
          color: extraClass ? undefined : textColor,
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && <h2 className="text-lg font-bold">{title}</h2>}
          <button
            className="p-2 rounded"
            style={extraClass ? {} : { color: textColor }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="py-4 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon || LayoutDashboard
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md py-2 pl-4 pr-2 text-sm font-medium"
                style={{
                  color: extraClass ? undefined : textColor,
                  backgroundColor: active ? hoverBg : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = hoverBg
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Contenido */}
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? 80 : 256 }}
      >
        <header className="sticky top-0 z-20 w-full bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
