'use server'

import { supabaseServer } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateBusinessWithLogo(business, formData) {
  const supabase = supabaseServer()

  try {
    // Manejar logo
    let logoUrl = business.logo_url
    const file = formData.get('logo')

    if (file && file.size > 0) {
      const fileName = `${business.id}-${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true })

      if (uploadErr) throw new Error(`Error subiendo logo: ${uploadErr.message}`)

      const { data: pub } = supabase.storage.from('logos').getPublicUrl(fileName)
      logoUrl = pub.publicUrl
    }

    // Actualizar negocio
    const updatedFields = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      phone: formData.get('phone') || null,
      email: formData.get('email') || null,
      description: formData.get('description') || null,
      logo_url: logoUrl,
    }

    const { error } = await supabase.from('businesses').update(updatedFields).eq('id', business.id)

    if (error) throw new Error(`Error actualizando negocio: ${error.message}`)
  } catch (err) {
    console.error('❌ Excepción en updateBusinessWithLogo:', err)
    throw new Error(`Error procesando el archivo del logo: ${err.message}`)
  }

  // 👇 redirigir fuera del try/catch para evitar NEXT_REDIRECT en el catch
  redirect('/dashboard/admin/business')
}

export async function removeBusiness(id) {
  const supabase = supabaseServer()
  const { error } = await supabase.from('businesses').delete().eq('id', id)
  if (error) throw new Error('Error eliminando negocio')

  redirect('/dashboard/admin/business')
}
