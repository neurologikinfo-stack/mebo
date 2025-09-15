import { supabaseServer } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/admin/businesses/:id
export async function GET(req, { params }) {
  const { id } = params
  const supabase = supabaseServer()

  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, email, phone, description, logo_url, created_at, deleted_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, data })
}

// PATCH /api/admin/businesses/:id (actualizar info, no estado)
export async function PATCH(req, { params }) {
  const { id } = params
  const updates = await req.json()
  const supabase = supabaseServer()

  const { error } = await supabase.from('businesses').update(updates).eq('id', id)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/businesses/:id (hard delete ⚠️)
export async function DELETE(req, { params }) {
  const { id } = params
  const supabase = supabaseServer()

  const { error } = await supabase.from('businesses').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
