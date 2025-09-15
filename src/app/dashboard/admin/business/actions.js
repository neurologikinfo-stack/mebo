'use server'

import { supabaseServer } from '@/utils/supabase/server'
import slugify from 'slugify'
import { redirect } from 'next/navigation'

/**
 * Genera un slug único
 */
async function generateUniqueSlug(baseSlug, supabase) {
  let slug = slugify(baseSlug || '', { lower: true, strict: true })
  if (!slug) slug = `negocio-${Date.now()}`

  let uniqueSlug = slug
  let counter = 1

  while (true) {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', uniqueSlug)
      .maybeSingle()

    if (!data) break
    uniqueSlug = `${slug}-${counter++}`
  }

  return uniqueSlug
}

/**
 * Verifica si el nombre es único
 */
async function validateUniqueName(name, supabase) {
  const { data } = await supabase.from('businesses').select('id').eq('name', name).maybeSingle()

  return !data
}

/**
 * Server Action: Crear negocio
 */
export async function createBusinessAction(prevState, formData) {
  try {
    const supabase = supabaseServer()

    const name = formData.get('name')?.trim()
    let slug = formData.get('slug')?.trim()
    const phone = formData.get('phone')?.trim() || null
    const email = formData.get('email')?.trim() || null
    const description = formData.get('description')?.trim() || null
    const address = formData.get('address')?.trim()
    const city = formData.get('city')?.trim()
    const province = formData.get('province')?.trim() || null
    const postal_code = formData.get('postal_code')?.trim() || null
    const country = formData.get('country')?.trim() || null
    const owner_id = formData.get('owner_id')

    if (!name) return { error: 'El nombre es obligatorio.' }
    if (!owner_id) return { error: 'Debes asignar un owner.' }

    // Validar nombre único
    const isNameAvailable = await validateUniqueName(name, supabase)
    if (!isNameAvailable) {
      return { error: 'Ese nombre ya está en uso. Prueba con otro.' }
    }

    // Generar slug único
    slug = slug || slugify(name, { lower: true, strict: true })
    slug = await generateUniqueSlug(slug, supabase)

    // Buscar owner
    const { data: owner, error: ownerError } = await supabase
      .from('owners')
      .select('id, clerk_id, status')
      .eq('id', owner_id)
      .maybeSingle()

    if (ownerError || !owner) {
      return { error: 'No se encontró el owner.' }
    }

    // Buscar profile (puede no existir si el owner está en pending)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', owner.clerk_id)
      .maybeSingle()

    const createdBy = profile ? profile.id : null

    // Insertar negocio
    const { data, error } = await supabase
      .from('businesses')
      .insert([
        {
          name,
          slug,
          phone,
          email,
          description,
          address,
          city,
          province,
          postal_code,
          country,
          owner_id: owner.id,
          owner_clerk_id: owner.clerk_id,
          created_by: createdBy,
          logo_url: null, // 👈 se añadirá al editar
        },
      ])
      .select('id, slug')
      .single()

    if (error) {
      const msg = /duplicate|unique/i.test(error.message)
        ? 'Ese slug ya existe. Prueba con otro.'
        : error.message
      return { error: msg }
    }

    // ✅ Éxito: redirigir
    redirect('/dashboard/admin/business')
  } catch (err) {
    console.error('❌ Excepción en createBusinessAction:', err)
    return { error: err.message }
  }
}

/**
 * Server Action: Actualizar negocio
 */
export async function updateBusiness(id, updates) {
  try {
    const supabase = supabaseServer()

    const { error } = await supabase.from('businesses').update(updates).eq('id', id)

    if (error) {
      console.error('❌ Error actualizando negocio:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    console.error('❌ Excepción en updateBusiness:', err)
    return { ok: false, error: err.message }
  }
}

/**
 * Server Action: Eliminar negocio
 */
export async function deleteBusiness(id) {
  try {
    const supabase = supabaseServer()

    const { error } = await supabase.from('businesses').delete().eq('id', id)

    if (error) {
      console.error('❌ Error eliminando negocio:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    console.error('❌ Excepción en deleteBusiness:', err)
    return { ok: false, error: err.message }
  }
}
