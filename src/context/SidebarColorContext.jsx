'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'

// 🔹 Paleta de presets a HEX
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
  'preset:blanco': '#ffffff', // 👈 en lugar de claro
}

const SidebarColorContext = createContext(undefined)

// 🔹 utilidades
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function getContrastYIQ(hex) {
  const { r, g, b } = hexToRgb(hex)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? '0 0 0' : '255 255 255' // negro o blanco en formato RGB
}

export function SidebarColorProvider({ role, children }) {
  const [color, setColor] = useState('preset:gris')

  function applyBrandColor(value) {
    let hex = ''

    if (value?.startsWith('#')) {
      hex = value
    } else if (presetColors[value]) {
      hex = presetColors[value]
    }

    if (hex) {
      const { r, g, b } = hexToRgb(hex)
      const contrast = getContrastYIQ(hex)

      document.documentElement.style.setProperty('--primary', `${r} ${g} ${b}`)
      document.documentElement.style.setProperty('--primary-foreground', contrast)
    }
  }

  useEffect(() => {
    async function fetchColor() {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('role', role)
        .maybeSingle()

      if (data?.value) {
        setColor(data.value)
        applyBrandColor(data.value)
      }
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
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [role])

  useEffect(() => {
    if (color) applyBrandColor(color)
  }, [color])

  return (
    <SidebarColorContext.Provider value={{ color, setColor }}>
      {children}
    </SidebarColorContext.Provider>
  )
}

export function useSidebarColor() {
  const ctx = useContext(SidebarColorContext)
  if (!ctx) throw new Error('useSidebarColor debe usarse dentro de SidebarColorProvider')
  return ctx
}
