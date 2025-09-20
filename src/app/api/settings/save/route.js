import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service Role Key
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { clerk_id, role, value, min_luminosity, max_luminosity } = body

    if (!clerk_id || !value) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const { error } = await supabase.from('settings').upsert(
      {
        clerk_id,
        role,
        value,
        min_luminosity,
        max_luminosity,
      },
      { onConflict: 'clerk_id' }
    )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error saving settings:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
