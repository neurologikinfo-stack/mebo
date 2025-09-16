import { NextResponse } from 'next/server'
import { supabaseServer } from '@/utils/supabase/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// ==========================
// GET: obtener un owner + businesses (por clerk_id)
// ==========================
export async function GET(req, { params }) {
  try {
    const { clerk_id } = params
    if (!clerk_id) {
      return NextResponse.json({ ok: false, error: 'Falta clerk_id' }, { status: 400 })
    }

    const supabase = supabaseServer()

    const { data, error } = await supabase
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
      .eq('clerk_id', clerk_id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: 'Owner no encontrado' }, { status: 404 })
    }

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
// PATCH: actualizar owner + profile + Clerk (por clerk_id)
// ==========================
export async function PATCH(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    }

    const { clerk_id } = params
    const body = await req.json()
    const { full_name, status, phone, avatar_url } = body

    if (!clerk_id) {
      return NextResponse.json({ ok: false, error: 'Falta clerk_id' }, { status: 400 })
    }

    const supabase = supabaseServer()

    // 1️⃣ Actualizar estado en owners
    const { error: updateOwnerError } = await supabase
      .from('owners')
      .update({ status })
      .eq('clerk_id', clerk_id)

    if (updateOwnerError) {
      return NextResponse.json({ ok: false, error: updateOwnerError.message }, { status: 400 })
    }

    // 2️⃣ Actualizar perfil en profiles
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        avatar_url,
      })
      .eq('clerk_id', clerk_id)

    if (updateProfileError) {
      return NextResponse.json({ ok: false, error: updateProfileError.message }, { status: 400 })
    }

    // 3️⃣ Sincronizar en Clerk
    try {
      await clerkClient.users.updateUser(clerk_id, {
        firstName: full_name, // nombre
        lastName: '.', // placeholder para que se muestre siempre algo
        imageUrl: avatar_url, // avatar
        publicMetadata: {
          phone: phone || null, // guardamos teléfono en metadata pública
        },
      })
    } catch (clerkErr) {
      console.warn('⚠️ No se pudo actualizar Clerk:', clerkErr.message)
      // no cortamos el flujo: si falla Clerk, Supabase ya quedó actualizado
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 })
  }
}

// ==========================
// DELETE: eliminar owner (por clerk_id)
// ==========================
export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    }

    const { clerk_id } = params
    if (!clerk_id) {
      return NextResponse.json({ ok: false, error: 'Falta clerk_id' }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { error } = await supabase.from('owners').delete().eq('clerk_id', clerk_id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 })
  }
}
