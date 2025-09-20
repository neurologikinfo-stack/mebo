'use client'

import { useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

export function useSupabaseWithClerk() {
  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }, [])

  return supabase
}
