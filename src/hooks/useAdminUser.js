'use client'
import { useEffect, useState, useCallback } from 'react'

export default function useAdminUser(clerk_id) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // 🔹 Cargar usuario desde API
  const fetchUser = useCallback(async () => {
    if (!clerk_id) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/users/${clerk_id}`, {
        cache: 'no-store',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'No se pudo cargar el usuario')
      }

      const result = await res.json()
      setUser(result.data || null)
    } catch (err) {
      console.error('❌ Error en useAdminUser:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [clerk_id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // 🔹 Guardar cambios en API
  async function saveUser(updates) {
    if (!clerk_id) return { ok: false, error: 'Falta clerk_id' }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/users/${clerk_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al guardar')
      }

      const result = await res.json()
      setUser(result.data)
      return { ok: true, data: result.data }
    } catch (err) {
      console.error('❌ Error guardando user:', err.message)
      setError(err.message)
      return { ok: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return { user, loading, error, saving, refetch: fetchUser, saveUser }
}
