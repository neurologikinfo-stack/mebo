import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ service_role (ignora RLS)
)

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const clerk_id = formData.get('clerk_id')
    const full_name = formData.get('full_name') || null
    const phone = formData.get('phone') || null

    if (!file || !clerk_id) {
      return NextResponse.json({ ok: false, error: 'Faltan parámetros' }, { status: 400 })
    }

    // 1️⃣ Subir archivo a Supabase
    const filePath = `${clerk_id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // 2️⃣ Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // 3️⃣ Guardar en profiles (Supabase = master)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        full_name,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerk_id)

    if (profileError) throw profileError

    // 4️⃣ Clerk (sincronizar avatar/nombre para UserButton)
    try {
      const [firstName, ...rest] = (full_name || '').split(' ')
      const lastName = rest.join(' ') || null

      const finalImageUrl = publicUrl // 👈 siempre aseguramos URL válida

      if (finalImageUrl) {
        await clerkClient.users.updateUser(clerk_id, {
          firstName: firstName || null,
          lastName,
          imageUrl: finalImageUrl,
        })

        console.log('ℹ️ Clerk sincronizado con avatar:', finalImageUrl)
      } else {
        console.warn('⚠️ No se generó publicUrl para avatar, Clerk no actualizado')
      }
    } catch (clerkErr) {
      console.warn('⚠️ Clerk no se actualizó, pero Supabase sí:', clerkErr.message)
    }

    // 5️⃣ Respuesta al frontend (consistente con PATCH)
    return NextResponse.json({ ok: true, url: publicUrl, path: filePath })
  } catch (err) {
    console.error('❌ Error en upload-avatar:', err)
    return NextResponse.json({ ok: false, error: err.message || 'Error interno' }, { status: 500 })
  }
}
