'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/utils/supabase/client'

export default function useProfile() {
  const { user } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // 🔹 Cargar perfil
  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      setLoading(true)
      setError(null)

      try {
        const clerkId = user.id
        const clerkIdNoPrefix = clerkId.replace(/^user_/, '')

        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, avatar_url, role, clerk_id')
          .or(`clerk_id.eq.${clerkId},clerk_id.eq.${clerkIdNoPrefix}`)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setProfile(data)
        } else {
          // inicializar si no existe
          setProfile({
            full_name: user.fullName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            phone: '',
            avatar_url: '',
            role: 'owner',
            clerk_id: clerkId,
          })
        }
      } catch (err) {
        console.error('❌ Error cargando perfil:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  // 🔹 Guardar cambios
  async function saveProfile(updates) {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          clerk_id: user.id,
          ...updates,
        },
        { onConflict: ['clerk_id'] }
      )

      if (error) throw error

      setProfile((prev) => ({ ...prev, ...updates }))
      return { ok: true }
    } catch (err) {
      console.error('❌ Error guardando perfil:', err)
      return { ok: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // 🔹 Subir avatar
  // dentro de useProfile.js
  async function uploadAvatar(file) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${clerk_id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Subir archivo al bucket avatars
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const avatar_url = publicUrlData.publicUrl

      // Actualizar perfil
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('clerk_id', clerk_id)
        .select()
        .single()

      if (error) throw error

      return { ok: true, avatar_url }
    } catch (err) {
      console.error('❌ Error subiendo avatar:', err.message)
      return { ok: false, error: err.message }
    }
  }

  return {
    profile,
    loading,
    error,
    saving,
    saveProfile,
    uploadAvatar,
  }
}
