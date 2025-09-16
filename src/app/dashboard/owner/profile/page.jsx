'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import useOwnerUser from '@/hooks/useOwnerUser'

export default function OwnerProfilePage() {
  const { user } = useUser()
  const clerk_id = user?.id // 👈 ID de Clerk (text, tipo "user_xxx")

  const { user: dbUser, loading, error, saving, saveUser } = useOwnerUser(clerk_id)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    role: 'owner',
  })
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  // 🔹 Inicializar datos
  useEffect(() => {
    if (dbUser) {
      setForm({
        full_name: dbUser.full_name || user.fullName || '',
        email: dbUser.email || user.primaryEmailAddress?.emailAddress || '',
        phone: dbUser.phone || '',
        avatar_url: dbUser.avatar_url || '',
        role: dbUser.role || 'owner',
      })
    }
  }, [dbUser, user])

  // 🔹 Subir avatar
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !clerk_id) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clerk_id', clerk_id)

      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()
      if (!res.ok || !result.ok) throw new Error(result.error)

      setForm((prev) => ({ ...prev, avatar_url: result.url }))
      setMessage('✅ Avatar actualizado')
    } catch (err) {
      setMessage('❌ ' + err.message)
    } finally {
      setUploading(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  // 🔹 Guardar cambios
  async function handleSave(e) {
    e.preventDefault()
    if (!clerk_id) return

    try {
      const res = await saveUser(form)
      if (!res.ok) throw new Error(res.error || 'No se pudo actualizar')

      setMessage('✅ Perfil actualizado correctamente')
    } catch (err) {
      setMessage('❌ ' + err.message)
    } finally {
      setTimeout(() => setMessage(''), 4000)
    }
  }

  if (!clerk_id) return <p className="p-6">⚠️ No autenticado</p>
  if (loading) return <p className="p-6">⏳ Cargando perfil...</p>
  if (error) return <p className="p-6 text-red-500">❌ {error}</p>

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Perfil Propietario</h1>

      {message && (
        <p className={`text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <img
            src={form.avatar_url || '/default-avatar.png'}
            alt="Avatar"
            className="w-20 h-20 rounded-full border object-cover"
          />
          <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
        </div>

        <div>
          <label>Nombre completo</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            disabled
            className="block w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 506 555 1234"
            className="block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label>Rol</label>
          <input
            type="text"
            value={form.role}
            disabled
            className="block w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
        >
          {saving || uploading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
