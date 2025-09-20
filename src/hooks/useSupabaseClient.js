'use client'

import { useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

export function useSupabaseClient() {
  const { isSignedIn, getToken } = useAuth()

  const supabase = useMemo(() => {
    if (!isSignedIn) {
      console.warn('⚠️ Usuario no autenticado en Clerk')
      return null
    }

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          fetch: async (url, options = {}) => {
            // 👇 Pedimos el token fresco de Clerk
            const token = await getToken({ template: 'supabase' })

            if (!token) {
              console.warn('⚠️ Clerk no devolvió un token supabase')
              return fetch(url, options) // fallback sin auth
            }

            const headers = new Headers(options?.headers)
            headers.set('Authorization', `Bearer ${token}`)

            return fetch(url, { ...options, headers })
          },
        },
      }
    )
  }, [isSignedIn, getToken])

  return supabase
}
