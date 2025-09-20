'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Check } from 'lucide-react'

const presetColors = [
  { label: 'Azul', value: '#2563eb' },
  { label: 'Rojo', value: '#dc2626' },
  { label: 'Amarillo', value: '#facc15' },
  { label: 'Verde', value: '#16a34a' },
  { label: 'Naranja', value: '#f97316' },
  { label: 'Gris', value: '#1f2937' },
  { label: 'Cian', value: '#06b6d4' },
  { label: 'Púrpura', value: '#9333ea' },
  { label: 'Rosa', value: '#db2777' },
  { label: 'Negro', value: '#000000' },
  { label: 'Blanco', value: '#ffffff' },
]

const roles = ['admin', 'owner', 'customer']

export default function AdminUISettingsPage() {
  const [defaults, setDefaults] = useState({})
  const [loading, setLoading] = useState(true)

  // 🔹 Cargar colores por defecto
  useEffect(() => {
    async function fetchDefaults() {
      const { data, error } = await supabase.from('role_defaults').select('role, default_color')

      if (error) {
        console.error('❌ Error cargando defaults:', error)
        setLoading(false)
        return
      }

      const initial = {}
      roles.forEach((r) => {
        const found = data?.find((row) => row.role === r)
        initial[r] = found ? found.default_color : '#2563eb' // azul si no hay
      })

      setDefaults(initial)
      setLoading(false)
    }

    fetchDefaults()
  }, [])

  // 🔹 Guardar default
  async function handleSave(role, value) {
    const { error } = await supabase
      .from('role_defaults')
      .upsert({ role, default_color: value }, { onConflict: 'role' })

    if (!error) {
      setDefaults((prev) => ({ ...prev, [role]: value }))
      alert(`✅ Color por defecto de ${role} actualizado`)
    }
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Colores por defecto</h1>
      <p className="text-muted-foreground">
        Define el color inicial de sidebar para cada rol. Este valor se aplica solo la primera vez
        que un usuario entra, luego pueden cambiarlo en su perfil.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role} className="p-6 bg-card rounded-xl border space-y-4 shadow">
            <h2 className="text-lg font-semibold capitalize">{role}</h2>

            {/* Presets */}
            <div className="grid grid-cols-6 gap-3">
              {presetColors.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSave(role, opt.value)}
                  className={`relative w-10 h-10 rounded-full border ${
                    defaults[role] === opt.value ? 'ring-2 ring-primary' : 'border-border'
                  }`}
                  style={{ backgroundColor: opt.value }}
                >
                  {defaults[role] === opt.value && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white dark:text-black" />
                  )}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div
              className="w-full h-10 rounded-md border"
              style={{ backgroundColor: defaults[role] }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
