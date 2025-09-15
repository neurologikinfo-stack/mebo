import { NextResponse } from 'next/server'
import { supabaseServer } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/clerk-sdk-node'

/**
 * GET /api/admin/owners
 * Devuelve todos los owners con avatar y cantidad de negocios
 */
export async function GET() {
  try {
    const supabase = supabaseServer()

    // 1. Traer owners + profiles + negocios
    const { data: owners, error } = await supabase
      .from('owners')
      .select(
        `
        id,
        clerk_id,
        full_name,
        email,
        status,
        created_at,
        profiles:profiles!inner (
          avatar_url
        ),
        businesses ( id )
      `
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!owners || owners.length === 0) {
      return NextResponse.json({ ok: true, data: [] })
    }

    // 2. Aplanar datos y contar negocios
    const enrichedOwners = owners.map((o) => ({
      id: o.id,
      clerk_id: o.clerk_id,
      full_name: o.full_name,
      email: o.email,
      status: o.status,
      created_at: o.created_at,
      avatar_url: o.profiles?.avatar_url || null,
      businesses_count: o.businesses ? o.businesses.length : 0,
    }))

    return NextResponse.json({ ok: true, data: enrichedOwners })
  } catch (err) {
    console.error('❌ Error en GET /owners:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/owners
 * Crea invitación en Clerk y la guarda en Supabase
 */
export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { full_name, email } = body

    if (!full_name || !email) {
      return NextResponse.json(
        { ok: false, error: 'Faltan campos obligatorios (full_name, email)' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/dashboard/owner`

    // Crear invitación en Clerk
    let invitation
    try {
      invitation = await clerkClient.invitations.createInvitation({
        email_address: email.trim(),
        redirect_url: redirectUrl,
        public_metadata: { role: 'owner' },
      })
    } catch (clerkErr) {
      const message =
        clerkErr.errors?.map((e) => e.message).join(', ') ||
        clerkErr.message ||
        'Request body invalid'
      return NextResponse.json(
        {
          ok: false,
          error: 'Error creando invitación en Clerk',
          details: message,
        },
        { status: 400 }
      )
    }

    if (!invitation?.id) {
      return NextResponse.json(
        { ok: false, error: 'Clerk no devolvió un ID válido' },
        { status: 500 }
      )
    }

    // Guardar en Supabase
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('owners')
      .insert([
        {
          full_name,
          email,
          clerk_id: null, // 🔹 se llenará cuando acepte la invitación
          clerk_invitation_id: invitation.id,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'Error en Supabase', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      data,
      invitationUrl: invitation.url,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT() {
  return NextResponse.json({ ok: false, error: 'Method Not Allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ ok: false, error: 'Method Not Allowed' }, { status: 405 })
}
