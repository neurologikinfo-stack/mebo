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

// 🔹 Función para aclarar u oscurecer colores
function adjustColor(hex, percent) {
  hex = hex.replace(/^#/, '')
  const num = parseInt(hex, 16)
  let r = (num >> 16) + percent
  let g = ((num >> 8) & 0x00ff) + percent
  let b = (num & 0x0000ff) + percent

  r = Math.min(255, Math.max(0, r))
  g = Math.min(255, Math.max(0, g))
  b = Math.min(255, Math.max(0, b))

  return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
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

  // 🔹 Cargar colores actuales desde Supabase
  useEffect(() => {
    async function fetchColors() {
      const { data } = await supabase.from('settings').select('role, value')
      if (data) {
        const newColors = { ...colors }
        const newCustom = { ...customColors }
        data.forEach((row) => {
          if (row.value.startsWith('#')) {
            newColors[row.role] = 'custom'
            newCustom[row.role] = row.value
          } else {
            newColors[row.role] = row.value
          }
        })
        setColors(newColors)
        setCustomColors(newCustom)
      }
    }
    fetchColors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 🔹 Guardar color
  async function handleSave(role) {
    let base =
      colors[role] === 'custom'
        ? customColors[role]
        : presetColors.find((c) => c.value === colors[role])?.hex

    let value = adjustColor(base, adjustments[role])

    const { error } = await supabase
      .from('settings')
      .upsert({ role, value }, { onConflict: 'role' })

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

      {roles.map((role) => (
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

            {/* 🔹 Custom */}
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

          {/* 🔹 Ajustes de luminosidad (siempre visible) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground">Ajustar luminosidad</label>
            <input
              type="range"
              min={-50}
              max={50}
              step={10}
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

          <button
            onClick={() => handleSave(role)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Guardar
          </button>
        </div>
      ))}
    </div>
  )
}
