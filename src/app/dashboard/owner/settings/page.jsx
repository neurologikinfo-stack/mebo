'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useSidebarColor } from '@/context/SidebarColorContext'
import { Check } from 'lucide-react'

// 🔹 Paleta de colores
const presetColors = [
  { label: 'Azul', value: 'preset:azul', hex: '#2563eb' },
  { label: 'Rojo', value: 'preset:rojo', hex: '#dc2626' },
  { label: 'Amarillo', value: 'preset:amarillo', hex: '#facc15' },
  { label: 'Verde', value: 'preset:verde', hex: '#16a34a' },
  { label: 'Naranja', value: 'preset:naranja', hex: '#f97316' },
  { label: 'Gris', value: 'preset:gris', hex: '#1f2937' },
  { label: 'Cian', value: 'preset:cian', hex: '#06b6d4' },
  { label: 'Púrpura', value: 'preset:purpura', hex: '#9333ea' },
  { label: 'Rosa', value: 'preset:rosa', hex: '#db2777' },
  { label: 'Negro', value: 'preset:negro', hex: '#000000' },
  { label: 'Blanco', value: 'preset:blanco', hex: '#ffffff' },
]

// --- Utils HEX <-> HSL ---
function hexToHsl(hex) {
  hex = hex.replace(/^#/, '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s
  let l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return { h, s, l }
}

function hslToHex(h, s, l) {
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  const toHex = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function adjustColor(hex, percent, minL = 0.1, maxL = 0.9) {
  const { h, s, l } = hexToHsl(hex)
  let newL = l + percent / 100
  newL = Math.max(minL, Math.min(maxL, newL))
  return hslToHex(h, s, newL)
}

export default function OwnerSettingsPage() {
  const { setColor: setSidebarColor } = useSidebarColor()
  const role = 'owner'

  const [color, setColor] = useState('preset:azul')
  const [customColor, setCustomColor] = useState('#2563eb')
  const [adjustment, setAdjustment] = useState(0)

  useEffect(() => {
    async function fetchColor() {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('role', role)
        .maybeSingle()

      if (!error && data) {
        if (data.value.startsWith('#')) {
          setColor('custom')
          setCustomColor(data.value)
        } else {
          setColor(data.value)
        }
      } else {
        // Primera vez: insert azul
        await supabase.from('settings').insert({
          role,
          value: '#2563eb',
        })
      }
    }
    fetchColor()
  }, [])

  async function handleSave() {
    const base = color === 'custom' ? customColor : presetColors.find((c) => c.value === color)?.hex
    const value = adjustColor(base, adjustment)

    const { error } = await supabase
      .from('settings')
      .upsert({ role, value }, { onConflict: 'role' })

    if (!error) {
      setSidebarColor(value)
      alert('✅ Color del sidebar de Propietario actualizado')
    }
  }

  const base = color === 'custom' ? customColor : presetColors.find((c) => c.value === color)?.hex
  const previewColor = adjustColor(base, adjustment)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configuración Propietario</h1>
      <p className="text-muted-foreground">
        Aquí puedes administrar la configuración de tu cuenta como propietario.
      </p>

      <div className="p-6 bg-card rounded-xl shadow border space-y-4">
        <h2 className="text-lg font-semibold">Personalización</h2>
        <p className="text-sm text-muted-foreground">Elige un color para el sidebar</p>

        {/* Paleta */}
        <div className="flex flex-wrap gap-4">
          {presetColors.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setColor(opt.value)}
              className={`relative w-10 h-10 rounded-full border ${
                color === opt.value ? 'ring-2 ring-primary' : 'border-border'
              }`}
              style={{
                backgroundColor: opt.hex,
                borderColor: opt.value === 'preset:blanco' ? '#ccc' : undefined,
              }}
            >
              {color === opt.value && (
                <Check className="absolute inset-0 m-auto h-5 w-5 text-white dark:text-black" />
              )}
            </button>
          ))}

          {/* Custom */}
          <div className="relative w-10 h-10">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value)
                setColor('custom')
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className={`w-10 h-10 rounded-full border ${
                color === 'custom' ? 'ring-2 ring-primary' : 'border-border'
              }`}
              style={{
                background:
                  color === 'custom'
                    ? customColor
                    : 'linear-gradient(45deg, #f00, #0f0, #00f, #ff0, #0ff, #f0f)',
              }}
            />
          </div>
        </div>

        {/* Ajuste luminosidad con preview */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground">Ajustar luminosidad</label>
            <input
              type="range"
              min={-100}
              max={100}
              step={5}
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">{adjustment}%</p>
          </div>
          <div
            className="w-10 h-10 rounded-full border"
            style={{ backgroundColor: previewColor }}
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Guardar
        </button>
      </div>
    </div>
  )
}
