'use client'

import { useState, useEffect } from 'react'
import { useSidebarColor } from '@/context/SidebarColorContext'
import { useUser } from '@clerk/nextjs'
import { Check } from 'lucide-react'

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

// --- Utils
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

function hexToRgbString(hex) {
  const bigint = parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `${r} ${g} ${b}`
}

export default function AdminSettingsPage() {
  const { setColor } = useSidebarColor()
  const { user } = useUser()

  const clerkId = user?.id
  const role = user?.publicMetadata?.role || 'customer'

  const [color, setColorValue] = useState(null)
  const [customColor, setCustomColor] = useState(null)
  const [adjustment, setAdjustment] = useState(0)
  const [range, setRange] = useState({ min: 0.1, max: 0.9 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!clerkId) return
    async function fetchColor() {
      try {
        const res = await fetch(`/api/settings/fetch?clerk_id=${clerkId}`)
        const data = await res.json()

        if (data.value) {
          if (!data.value.startsWith('#')) {
            const preset = presetColors.find((c) => c.value === data.value)
            if (preset) setColorValue(data.value)
          } else {
            setColorValue('custom')
            setCustomColor(data.value)
          }
          setRange({
            min: data.min_luminosity || 0.1,
            max: data.max_luminosity || 0.9,
          })
        }
      } catch (err) {
        console.error('❌ Error leyendo color:', err)
      } finally {
        setIsLoaded(true)
      }
    }
    fetchColor()
  }, [clerkId])

  const baseColor =
    color === 'custom' ? customColor : presetColors.find((c) => c.value === color)?.hex || null
  const previewColor = baseColor ? adjustColor(baseColor, adjustment, range.min, range.max) : null

  useEffect(() => {
    if (previewColor) setColor(hexToRgbString(previewColor))
  }, [previewColor, setColor])

  async function handleSave() {
    if (!previewColor) return
    try {
      const res = await fetch('/api/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_id: clerkId,
          role,
          value: color === 'custom' ? customColor : color, // guardamos bien custom vs preset
          min_luminosity: range.min,
          max_luminosity: range.max,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error desconocido')

      alert('✅ Color del sidebar actualizado')
    } catch (err) {
      console.error('❌ Error guardando color:', err)
      alert('❌ No se pudo guardar el color. Revisa la consola.')
    }
  }

  if (!isLoaded) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Personalización de Sidebar</h1>
      <p className="text-muted-foreground">Configura tu color de sidebar personal.</p>

      <div className="p-6 bg-card text-card-foreground rounded-xl shadow border border-border space-y-4">
        <div className="flex flex-wrap gap-4">
          {presetColors.map((opt) => {
            const isSelected = color === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setColorValue(opt.value)}
                className={`relative w-10 h-10 rounded-full border ${
                  isSelected ? 'ring-2 ring-primary' : 'border-border'
                }`}
                style={{
                  backgroundColor: opt.hex,
                  borderColor: opt.value === 'preset:blanco' ? '#ccc' : undefined,
                }}
              >
                {isSelected && (
                  <Check
                    className="absolute inset-0 m-auto h-5 w-5"
                    style={{ color: opt.hex === '#ffffff' ? 'black' : 'white' }}
                  />
                )}
              </button>
            )
          })}

          {/* Custom */}
          <div
            className={`relative w-10 h-10 rounded-full border cursor-pointer ${
              color === 'custom' ? 'ring-2 ring-primary' : 'border-border'
            }`}
            onClick={() => setColorValue('custom')}
          >
            <input
              type="color"
              value={customColor || '#ffffff'}
              onChange={(e) => {
                setCustomColor(e.target.value)
                setColorValue('custom')
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  color === 'custom' && customColor
                    ? customColor
                    : 'linear-gradient(45deg, red, orange, yellow, green, cyan, blue, purple, magenta)',
              }}
            />
            {color === 'custom' && (
              <Check
                className="absolute inset-0 m-auto h-5 w-5"
                style={{ color: customColor === '#ffffff' ? 'black' : 'white' }}
              />
            )}
          </div>
        </div>

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
            style={{ backgroundColor: previewColor || '#fff' }}
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
