'use client'
import { useEffect, useState, useCallback } from 'react'

export default function useOwnerUser(clerk_id) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // 🔹 Cargar owner por clerk_id
  const fetchUser = useCallback(async () => {
    if (!clerk_id) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/owners/${clerk_id}`, {
        cache: 'no-store',
      })
      const result = await res.json()

      if (!res.ok || !result.ok) {
        throw new Error(result.error || 'No se pudo cargar el propietario')
      }

      // 🔹 Guardamos los datos planos que devuelve el backend
      setUser(result.data || null)
    } catch (err) {
      console.error('❌ Error en useOwnerUser:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [clerk_id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // 🔹 Guardar cambios
  async function saveUser(updates) {
    if (!clerk_id) return { ok: false, error: 'Falta clerk_id' }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/owners/${clerk_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const result = await res.json()
      if (!res.ok || !result.ok) {
        throw new Error(result.error || 'Error al guardar')
      }

      // 🔹 Mezclamos los cambios con lo que ya teníamos en memoria
      setUser((prev) => ({ ...prev, ...updates }))
      return { ok: true, data: { ...user, ...updates } }
    } catch (err) {
      console.error('❌ Error guardando owner:', err.message)
      setError(err.message)
      return { ok: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return {
    user,
    loading,
    error,
    saving,
    refetch: fetchUser,
    saveUser,
  }
}
