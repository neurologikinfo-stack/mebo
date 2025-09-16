'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useSidebarColor } from '@/context/SidebarColorContext'
import { Check } from 'lucide-react'

// 🔹 Paleta de colores corporativos
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

// 🔹 HEX → HSL
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

// 🔹 HSL → HEX
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

// 🔹 Ajusta luminosidad con límites desde Supabase
function adjustColor(hex, percent, minL = 0.1, maxL = 0.9) {
  const { h, s, l } = hexToHsl(hex)
  let newL = l + percent / 100
  newL = Math.max(minL, Math.min(maxL, newL)) // 👈 evitar 0% y 100%
  return hslToHex(h, s, newL)
}

const roles = ['admin', 'owner', 'customer']

export default function SettingsPage() {
  const { setColor } = useSidebarColor()

  const [colors, setColors] = useState({
    admin: 'preset:azul',
    owner: 'preset:azul',
    customer: 'preset:azul',
  })
  const [customColors, setCustomColors] = useState({
    admin: '#2563eb',
    owner: '#2563eb',
    customer: '#2563eb',
  })
  const [adjustments, setAdjustments] = useState({
    admin: 0,
    owner: 0,
    customer: 0,
  })
  const [luminosityRange, setLuminosityRange] = useState({
    admin: { min: 0.1, max: 0.9 },
    owner: { min: 0.1, max: 0.9 },
    customer: { min: 0.1, max: 0.9 },
  })

  // 🔹 Cargar desde Supabase (color + rango)
  useEffect(() => {
    async function fetchColors() {
      const { data } = await supabase
        .from('settings')
        .select('role, value, min_luminosity, max_luminosity')

      if (data) {
        const newColors = { ...colors }
        const newCustom = { ...customColors }
        const newRange = { ...luminosityRange }

        data.forEach((row) => {
          if (row.value.startsWith('#')) {
            newColors[row.role] = 'custom'
            newCustom[row.role] = row.value
          } else {
            newColors[row.role] = row.value
          }

          if (row.min_luminosity && row.max_luminosity) {
            newRange[row.role] = {
              min: row.min_luminosity,
              max: row.max_luminosity,
            }
          }
        })

        setColors(newColors)
        setCustomColors(newCustom)
        setLuminosityRange(newRange)
      }
    }
    fetchColors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 🔹 Guardar en Supabase
  async function handleSave(role) {
    let base =
      colors[role] === 'custom'
        ? customColors[role]
        : presetColors.find((c) => c.value === colors[role])?.hex

    let value = adjustColor(
      base,
      adjustments[role],
      luminosityRange[role].min,
      luminosityRange[role].max
    )

    const { error } = await supabase.from('settings').upsert(
      {
        role,
        value,
        min_luminosity: luminosityRange[role].min,
        max_luminosity: luminosityRange[role].max,
      },
      { onConflict: 'role' }
    )

    if (!error) {
      setColor(value)
      alert(`✅ Color del sidebar para ${role} actualizado`)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configuración General</h1>
      <p className="text-muted-foreground">
        Aquí puedes administrar la personalización de la interfaz para cada tipo de usuario.
      </p>

      {/* GRID para que en desktop se muestren de 2 en 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => {
          let base =
            colors[role] === 'custom'
              ? customColors[role]
              : presetColors.find((c) => c.value === colors[role])?.hex

          let previewColor = adjustColor(
            base,
            adjustments[role],
            luminosityRange[role].min,
            luminosityRange[role].max
          )

          return (
            <div
              key={role}
              className="p-6 bg-card text-card-foreground rounded-xl shadow border border-border space-y-4"
            >
              <h2 className="text-lg font-semibold capitalize">Personalización {role}</h2>
              <p className="text-sm text-muted-foreground">Elige un color para el sidebar</p>

              {/* 🔹 Paleta de presets */}
              <div className="grid grid-cols-6 gap-4">
                {presetColors.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setColors((prev) => ({
                        ...prev,
                        [role]: opt.value,
                      }))
                    }
                    className={`relative w-10 h-10 rounded-full border ${
                      colors[role] === opt.value ? 'ring-2 ring-primary' : 'border-border'
                    }`}
                    style={{
                      backgroundColor: opt.hex,
                      borderColor: opt.value === 'preset:blanco' ? '#ccc' : undefined,
                    }}
                  >
                    {colors[role] === opt.value && (
                      <Check className="absolute inset-0 m-auto h-5 w-5 text-white dark:text-black" />
                    )}
                  </button>
                ))}

                {/* 🔹 Custom con gradiente */}
                <div className="relative w-10 h-10">
                  <input
                    type="color"
                    value={customColors[role]}
                    onChange={(e) =>
                      setCustomColors((prev) => ({
                        ...prev,
                        [role]: e.target.value,
                      }))
                    }
                    onClick={() =>
                      setColors((prev) => ({
                        ...prev,
                        [role]: 'custom',
                      }))
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className={`w-10 h-10 rounded-full border ${
                      colors[role] === 'custom' ? 'ring-2 ring-primary' : 'border-border'
                    }`}
                    style={{
                      background:
                        colors[role] === 'custom'
                          ? customColors[role]
                          : 'linear-gradient(45deg, #f00, #0f0, #00f, #ff0, #0ff, #f0f)',
                    }}
                  />
                </div>
              </div>

              {/* 🔹 Ajustes de luminosidad + preview */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground">
                    Ajustar luminosidad
                  </label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={5}
                    value={adjustments[role]}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        [role]: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">{adjustments[role]}%</p>
                </div>
                {/* Preview dinámico */}
                <div
                  className="w-10 h-10 rounded-full border"
                  style={{ backgroundColor: previewColor }}
                />
              </div>

              <button
                onClick={() => handleSave(role)}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Guardar
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
