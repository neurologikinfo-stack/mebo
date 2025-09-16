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

export default function OwnerSettingsPage() {
  const { setColor: setSidebarColor } = useSidebarColor()
  const [color, setColor] = useState('preset:azul')
  const [customColor, setCustomColor] = useState('#2563eb')

  // 🔹 cargar color actual desde Supabase para rol owner
  useEffect(() => {
    async function fetchColor() {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('role', 'owner')
        .maybeSingle()

      if (data?.value) {
        if (data.value.startsWith('#')) {
          setColor('custom')
          setCustomColor(data.value)
        } else {
          setColor(data.value)
        }
      }
    }
    fetchColor()
  }, [])

  // 🔹 guardar color en Supabase + actualizar Sidebar al instante
  async function handleSave() {
    const value = color === 'custom' ? customColor : color
    const { error } = await supabase
      .from('settings')
      .upsert({ role: 'owner', value }, { onConflict: 'role' })

    if (!error) {
      setSidebarColor(value)
      alert('✅ Color del sidebar de Propietario actualizado')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configuración Propietario</h1>
      <p className="text-muted-foreground">
        Aquí puedes administrar la configuración de tu cuenta como propietario, las preferencias de
        tus negocios y notificaciones.
      </p>

      {/* 🔹 Configuración de Sidebar */}
      <div className="p-6 bg-card text-card-foreground rounded-xl shadow border border-border space-y-4">
        <h2 className="text-lg font-semibold">Personalización</h2>
        <p className="text-sm text-muted-foreground">Elige un color para el sidebar</p>

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

        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Guardar
        </button>
      </div>

      {/* 🔹 Otras configuraciones */}
      <div className="p-6 bg-card text-card-foreground rounded-xl shadow border border-border space-y-4">
        <h2 className="text-lg font-semibold">Opciones</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Configurar alertas de pagos</li>
          <li>Preferencias de comunicación con clientes</li>
          <li>Actualizar contraseña</li>
          <li>Eliminar cuenta</li>
        </ul>
      </div>
    </div>
  )
}
