import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service role: bypass RLS
)

// 🔹 GET: listar todas las policies
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('policies_catalog')
      .select('id, policyname, cmd, roles, permissive')
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('❌ Error en GET /api/admin/policies:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// 🔹 POST: crear una nueva policy
export async function POST(req) {
  try {
    const body = await req.json()
    const { policyname, cmd, roles, permissive } = body

    if (!policyname || !cmd) {
      return NextResponse.json(
        { ok: false, error: 'policyname y cmd son obligatorios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('policies_catalog')
      .insert([{ policyname, cmd, roles, permissive }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('❌ Error en POST /api/admin/policies:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// 🔹 DELETE: eliminar una policy por id
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Se requiere id' }, { status: 400 })
    }

    const { error } = await supabase.from('policies_catalog').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ ok: true, message: 'Policy eliminada' })
  } catch (err) {
    console.error('❌ Error en DELETE /api/admin/policies:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
