'use server'

import { supabaseServer } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateBusinessWithLogo(business, formData) {
  const supabase = supabaseServer()

  try {
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
    console.error('❌ updateBusinessWithLogo error:', err)
    throw err
  }

  redirect('/dashboard/owner/businesses')
}

// 🔹 Soft delete (activar/desactivar negocio)
export async function toggleBusinessStatus(id, deletedAt) {
  const supabase = supabaseServer()

  const { error } = await supabase
    .from('businesses')
    .update({
      deleted_at: deletedAt ? null : new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error('Error actualizando estado del negocio')

  redirect('/dashboard/owner/businesses')
}

// 🔹 Delete definitivo de un negocio
export async function removeBusiness(id) {
  const supabase = supabaseServer()

  const { error } = await supabase.from('businesses').delete().eq('id', id)

  if (error) {
    console.error('❌ Error eliminando negocio:', error.message)
    throw new Error(`Error eliminando negocio: ${error.message}`)
  }

  redirect('/dashboard/owner/businesses')
}
