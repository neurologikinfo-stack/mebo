'use client'

import { UserProfile, useUser } from '@clerk/nextjs'
import DashboardLayout from '@/components/DashboardLayout'
import { UserCog, Shield, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import useAdminUser from '@/hooks/useAdminUser'

export default function AccountPage() {
  const { user } = useUser()
  const clerk_id = user?.id

  const { user: dbUser, loading, error, saving, saveUser } = useAdminUser(clerk_id)

  const [form, setForm] = useState({
    phone: '',
    role: '',
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (dbUser) {
      setForm({
        phone: dbUser.phone || '',
        role: dbUser.role || '',
      })
    }
  }, [dbUser])

  async function handleSave(e) {
    e.preventDefault()
    if (!clerk_id) return

    try {
      const res = await saveUser({ ...dbUser, ...form })
      if (!res.ok) throw new Error(res.error || 'No se pudo actualizar')
      setMessage('✅ Datos adicionales guardados')
    } catch (err) {
      setMessage('❌ ' + err.message)
    } finally {
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const menuItems = [
    { name: 'Perfil', href: '/account', icon: UserCog },
    { name: 'Seguridad', href: '/account/security', icon: Shield },
    { name: 'Notificaciones', href: '/account/notifications', icon: Bell },
  ]

  return (
    <DashboardLayout title="Mi cuenta" menuItems={menuItems}>
      {/* 🔹 Bloque principal de Clerk */}
      <UserProfile
        path="/account"
        routing="path"
        appearance={{
          variables: {
            borderRadius: '0px',
            colorPrimary: 'rgb(var(--primary))',
            colorText: 'rgb(var(--foreground))',
            colorBackground: 'transparent',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
          },
          elements: {
            rootBox: 'w-full',
            card: 'bg-transparent border-0 shadow-none w-full p-0', // 👈 elimina borde/sombra
            profileSection__content: 'bg-transparent shadow-none', // 👈 extra fix
            navbar: 'hidden',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            page: 'w-full',
            pageScrollBox: 'p-0',
            profilePage: 'w-full',
            profileSection: 'w-full border-b last:border-0 py-6',
            profileSectionTitle: 'mb-3 pl-4 font-semibold text-lg',
            profileSectionContent: 'space-y-5 pl-4',
            formButtonPrimary:
              'bg-primary text-primary-foreground rounded-md px-5 py-2.5 font-semibold hover:opacity-90 transition',
            formFieldLabel: 'font-medium text-muted-foreground pl-4',
            formFieldInput:
              'rounded-md border border-input bg-background px-4 py-3 focus:ring-2 focus:ring-primary',
            formFieldAction: 'text-primary hover:underline',
            formFieldHint: 'text-muted-foreground pl-4',
          },
        }}
      />

      {/* 🔹 Extra fields (Supabase) */}
      <section className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Datos adicionales</h2>

        {message && (
          <p
            className={`mb-4 text-sm ${
              message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-muted-foreground">⏳ Cargando...</p>
        ) : error ? (
          <p className="text-red-500">❌ {error}</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="block w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <input
                type="text"
                value={form.role}
                disabled
                className="block w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        )}
      </section>
    </DashboardLayout>
  )
}
