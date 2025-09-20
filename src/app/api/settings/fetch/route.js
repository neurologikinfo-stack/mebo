import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service Role Key
)

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const clerk_id = url.searchParams.get('clerk_id')
    if (!clerk_id) return NextResponse.json({ error: 'Falta clerk_id' }, { status: 400 })

    const { data, error } = await supabase
      .from('settings')
      .select('value, min_luminosity, max_luminosity')
      .eq('clerk_id', clerk_id)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json(data || {})
  } catch (err) {
    console.error('Error fetch settings:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
