import { NextResponse } from 'next/server'
import { supabaseServer } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'

// ==========================
// GET: obtener un owner + businesses (por id o clerk_id)
// ==========================
export async function GET(req, { params }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Falta ID' }, { status: 400 })
    }

    const supabase = supabaseServer()

    // 1️⃣ Buscar primero por owners.id
    let { data, error } = await supabase
      .from('owners')
      .select(
        `
        id,
        clerk_id,
        status,
        created_at,
        profiles:profiles!inner (
          full_name,
          email,
          phone,
          avatar_url
        ),
        businesses (
          id,
          name,
          slug,
          email,
          phone,
          logo_url,
          deleted_at
        )
      `
      )
      .eq('id', id)
      .maybeSingle()

    // 2️⃣ Si no encontró, buscar por clerk_id
    if (!data || error) {
      const { data: alt, error: altErr } = await supabase
        .from('owners')
        .select(
          `
          id,
          clerk_id,
          status,
          created_at,
          profiles:profiles!inner (
            full_name,
            email,
            phone,
            avatar_url
          ),
          businesses (
            id,
            name,
            slug,
            email,
            phone,
            logo_url,
            deleted_at
          )
        `
        )
        .eq('clerk_id', id)
        .maybeSingle()

      data = alt
      error = altErr
    }

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: 'Owner no encontrado' }, { status: 404 })
    }

    // 🔹 Flatten para frontend
    const owner = {
      id: data.id,
      clerk_id: data.clerk_id,
      status: data.status,
      created_at: data.created_at,
      full_name: data.profiles?.full_name,
      email: data.profiles?.email,
      phone: data.profiles?.phone,
      avatar_url: data.profiles?.avatar_url,
      businesses: data.businesses || [],
    }

    return NextResponse.json({ ok: true, data: owner })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 })
  }
}

// ==========================
// PATCH: actualizar owner + profile
// ==========================
export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { full_name, status, phone, avatar_url } = body

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Falta ID' }, { status: 400 })
    }

    const supabase = supabaseServer()

    // 1️⃣ Buscar owner para obtener clerk_id
    const { data: owner, error: ownerError } = await supabase
      .from('owners')
      .select('id, clerk_id')
      .eq('id', id)
      .maybeSingle()

    if (ownerError || !owner) {
      return NextResponse.json(
        { ok: false, error: ownerError?.message || 'Owner no encontrado' },
        { status: 404 }
      )
    }

    // 2️⃣ Actualizar estado en owners
    const { error: updateOwnerError } = await supabase
      .from('owners')
      .update({ status })
      .eq('id', id)

    if (updateOwnerError) {
      return NextResponse.json({ ok: false, error: updateOwnerError.message }, { status: 400 })
    }

    // 3️⃣ Actualizar perfil en profiles
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        avatar_url,
      })
      .eq('clerk_id', owner.clerk_id)

    if (updateProfileError) {
      return NextResponse.json({ ok: false, error: updateProfileError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 })
  }
}

// ==========================
// DELETE: eliminar owner
// ==========================
export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Falta ID' }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { error } = await supabase.from('owners').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 })
  }
}
