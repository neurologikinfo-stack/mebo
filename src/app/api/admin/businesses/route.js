import { NextResponse } from 'next/server'
import { supabaseServer } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = supabaseServer()

    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, slug, email, phone, logo_url, created_at, deleted_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('❌ Error cargando negocios:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
