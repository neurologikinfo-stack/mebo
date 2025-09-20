'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'

// 🔹 Presets
const presetColors = {
  'preset:azul': '#2563eb',
  'preset:rojo': '#dc2626',
  'preset:amarillo': '#facc15',
  'preset:verde': '#16a34a',
  'preset:naranja': '#f97316',
  'preset:gris': '#1f2937',
  'preset:cian': '#06b6d4',
  'preset:purpura': '#9333ea',
  'preset:rosa': '#db2777',
  'preset:negro': '#000000',
  'preset:blanco': '#ffffff',
}

// 🔹 Helpers
function hexToRgbString(hex) {
  if (!hex || !hex.startsWith('#')) return hex
  const bigint = parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `${r} ${g} ${b}`
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function getContrastYIQ(hexOrRgb) {
  let r, g, b
  if (hexOrRgb.includes(' ')) {
    const parts = hexOrRgb.split(' ').map(Number)
    ;[r, g, b] = parts
  } else {
    const { r: rr, g: gg, b: bb } = hexToRgb(hexOrRgb)
    r = rr
    g = gg
    b = bb
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? '0 0 0' : '255 255 255'
}

const SidebarColorContext = createContext(undefined)

export function SidebarColorProvider({ role, children }) {
  const [color, setColor] = useState(null)
  const [loading, setLoading] = useState(true)

  function applyBrandColor(value) {
    if (!value) return

    let rgb
    if (value.startsWith('#')) {
      rgb = hexToRgbString(value)
    } else if (presetColors[value]) {
      rgb = hexToRgbString(presetColors[value])
    } else {
      rgb = value
    }

    const contrast = getContrastYIQ(rgb)

    // 👇 Debug temporal
    console.log('🎨 Aplicando color Sidebar:', {
      input: value,
      rgb,
      contrast,
    })

    document.documentElement.style.setProperty('--primary', rgb)
    document.documentElement.style.setProperty('--primary-foreground', contrast)
  }

  useEffect(() => {
    const stored = localStorage.getItem(`sidebar-color-${role}`)
    if (stored) {
      setColor(stored)
      applyBrandColor(stored)
    }

    async function fetchColor() {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('role', role)
        .maybeSingle()

      if (data?.value) {
        setColor(data.value)
        applyBrandColor(data.value)
        localStorage.setItem(`sidebar-color-${role}`, data.value)
      }
      setLoading(false)
    }

    fetchColor()

    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: `role=eq.${role}` },
        (payload) => {
          if (payload.new?.value) {
            setColor(payload.new.value)
            applyBrandColor(payload.new.value)
            localStorage.setItem(`sidebar-color-${role}`, payload.new.value)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [role])

  if (loading && !color) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Cargando...</span>
      </div>
    )
  }

  return (
    <SidebarColorContext.Provider
      value={{
        color,
        setColor: (value) => {
          setColor(value)
          applyBrandColor(value)
          localStorage.setItem(`sidebar-color-${role}`, value)
        },
      }}
    >
      {children}
    </SidebarColorContext.Provider>
  )
}

export function useSidebarColor() {
  const ctx = useContext(SidebarColorContext)
  if (!ctx) throw new Error('useSidebarColor debe usarse dentro de SidebarColorProvider')
  return ctx
}
