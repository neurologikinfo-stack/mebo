'use server'

import { supabaseServer } from '@/utils/supabase/server'
import slugify from 'slugify'

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
    const owner_id = formData.get('owner_id') || null

    if (!name) return { error: 'El nombre es obligatorio.' }

    // Validar nombre único
    const isNameAvailable = await validateUniqueName(name, supabase)
    if (!isNameAvailable) {
      return { error: 'Ese nombre ya está en uso. Prueba con otro.' }
    }

    // Generar slug único
    slug = slug || slugify(name, { lower: true, strict: true })
    slug = await generateUniqueSlug(slug, supabase)

    // 🔹 Owner opcional
    let owner = null
    let createdBy = null
    let ownerClerkId = null

    if (owner_id) {
      const { data: foundOwner, error: ownerError } = await supabase
        .from('owners')
        .select('id, clerk_id, status')
        .eq('id', owner_id)
        .maybeSingle()

      if (ownerError || !foundOwner) {
        return { error: 'No se encontró el owner.' }
      }

      owner = foundOwner
      ownerClerkId = owner.clerk_id

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', owner.clerk_id)
        .maybeSingle()

      createdBy = profile ? profile.id : null
    }

    // Insertar negocio
    const { error } = await supabase
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
          owner_id: owner ? owner.id : null,
          owner_clerk_id: ownerClerkId,
          created_by: createdBy,
          logo_url: null,
        },
      ])
      .single()

    if (error) {
      const msg = /duplicate|unique/i.test(error.message)
        ? 'Ese slug ya existe. Prueba con otro.'
        : error.message
      return { error: msg }
    }

    // ✅ éxito → devolvemos ok
    return { ok: true }
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

    // 🔹 Si en updates viene un owner_id, buscamos los datos
    let ownerId = updates.owner_id || null
    let ownerClerkId = null
    let createdBy = null

    if (ownerId) {
      const { data: foundOwner, error: ownerError } = await supabase
        .from('owners')
        .select('id, clerk_id, status')
        .eq('id', ownerId)
        .maybeSingle()

      if (ownerError || !foundOwner) {
        return { ok: false, error: 'No se encontró el owner.' }
      }

      ownerClerkId = foundOwner.clerk_id

      // Buscar profile del owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_id', foundOwner.clerk_id)
        .maybeSingle()

      createdBy = profile ? profile.id : null
    }

    // 🔹 Actualizamos el negocio
    const { error } = await supabase
      .from('businesses')
      .update({
        ...updates,
        owner_id: ownerId,
        owner_clerk_id: ownerClerkId,
        created_by: createdBy,
      })
      .eq('id', id)

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
 * Server Action: Activar / Desactivar negocio (soft delete)
 */
export async function toggleBusinessStatus(id, deletedAt) {
  try {
    const supabase = supabaseServer()

    const { error } = await supabase
      .from('businesses')
      .update({
        deleted_at: deletedAt ? null : new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('❌ Error cambiando estado del negocio:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    console.error('❌ Excepción en toggleBusinessStatus:', err)
    return { ok: false, error: err.message }
  }
}

/**
 * Server Action: Eliminar negocio (hard delete, solo admin)
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
