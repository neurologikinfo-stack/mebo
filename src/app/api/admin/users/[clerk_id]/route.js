import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Service role (ignora RLS)
)

// 🔹 GET: obtener un perfil desde Supabase (si no existe, lo crea)
export async function GET(req, context) {
  try {
    const { params } = await context
    const clerkId = params?.clerk_id

    if (!clerkId) {
      return NextResponse.json({ ok: false, error: 'Falta clerk_id' }, { status: 400 })
    }

    const decodedClerkId = decodeURIComponent(clerkId)

    // Buscar en Supabase (tabla profiles)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, clerk_id, email, full_name, phone, avatar_url, role, created_at, updated_at')
      .eq('clerk_id', decodedClerkId)
      .maybeSingle()

    if (error) throw error

    // ✅ Si no existe el perfil, lo creamos automáticamente
    if (!data) {
      const clerkUser = await clerkClient.users.getUser(decodedClerkId)

      const newProfile = {
        clerk_id: decodedClerkId,
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        full_name: clerkUser.fullName || '',
        phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
        avatar_url: clerkUser.imageUrl || null,
        role: 'admin', // 👈 default (puedes cambiarlo)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .maybeSingle()

      if (insertErr) throw insertErr

      return NextResponse.json({ ok: true, data: inserted })
    }

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('❌ Error en GET perfil:', err)
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 })
  }
}

// 🔹 PATCH: actualizar un perfil en Supabase y sincronizar con Clerk
export async function PATCH(req, context) {
  try {
    const { params } = await context
    const clerkId = params?.clerk_id

    if (!clerkId) {
      return NextResponse.json({ ok: false, error: 'Falta clerk_id' }, { status: 400 })
    }

    const decodedClerkId = decodeURIComponent(clerkId)
    const updates = await req.json()

    // --- 1. Verificar si existe
    const { data: existing, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', decodedClerkId)
      .maybeSingle()

    if (fetchErr) throw fetchErr

    let profileData = existing

    // --- 2. Si no existe, lo creamos
    if (!existing) {
      const clerkUser = await clerkClient.users.getUser(decodedClerkId)

      const newProfile = {
        clerk_id: decodedClerkId,
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        full_name: updates.full_name || clerkUser.fullName || '',
        phone: updates.phone || clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
        avatar_url: updates.avatar_url || clerkUser.imageUrl || null,
        role: updates.role || 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .maybeSingle()

      if (insertErr) throw insertErr
      profileData = inserted
    }

    // --- 3. Actualizar en Supabase
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name ?? profileData.full_name,
        phone: updates.phone ?? profileData.phone,
        avatar_url: updates.avatar_url ?? profileData.avatar_url,
        role: updates.role ?? profileData.role,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', decodedClerkId)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { ok: false, error: 'Usuario no encontrado ni creado' },
        { status: 404 }
      )
    }

    // --- 4. Sincronizar con Clerk
    try {
      const currentClerkUser = await clerkClient.users.getUser(decodedClerkId)

      const fullNameForClerk =
        updates.full_name || data.full_name || currentClerkUser.fullName || ''
      const [firstName, ...rest] = fullNameForClerk.split(' ')
      const lastName = rest.join(' ') || null

      const finalImageUrl =
        updates.avatar_url || data.avatar_url || currentClerkUser.imageUrl || null

      if (firstName || lastName || finalImageUrl) {
        await clerkClient.users.updateUser(decodedClerkId, {
          firstName: firstName || null,
          lastName,
          imageUrl: finalImageUrl,
        })
      }
    } catch (clerkErr) {
      console.warn('⚠️ Clerk no se actualizó, pero Supabase sí:', clerkErr.message)
    }

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('❌ Error en PATCH perfil:', err)
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 })
  }
}
