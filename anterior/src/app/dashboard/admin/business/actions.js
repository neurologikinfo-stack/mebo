"use server";

import { supabaseServer } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function slugify(s) {
  return s
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// 🔹 Generar slug único
async function generateUniqueSlug(baseSlug, supabase) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug; // ✅ libre

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

// 🔹 Validar nombre único
async function validateUniqueName(name, supabase) {
  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  return !data; // true si está libre, false si ya existe
}

// 🔹 Subir archivo de logo a Supabase Storage
async function uploadLogo(file, supabase, businessSlug, userId) {
  if (!file || file.size === 0) return null;

  const fileExt = file.name.split(".").pop();
  // 📂 Guardamos en carpeta con el userId → compatible con policy
  const fileName = `${userId}/${businessSlug}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("business-logos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error subiendo logo:", uploadError.message);
    return null;
  }

  // 🔹 Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from("business-logos")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function createOwnerBusiness(formData) {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, error: "Debes iniciar sesión para crear un negocio." };
  }

  const supabase = supabaseServer();

  const name = formData.get("name")?.trim();
  let slug = formData.get("slug")?.trim();
  const phone = formData.get("phone")?.trim() || null;
  const email = formData.get("email")?.trim() || null;
  const description = formData.get("description")?.trim() || null;
  const file = formData.get("logo"); // 👈 archivo del input file

  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  // 🔹 Validar que el nombre sea único
  const isNameAvailable = await validateUniqueName(name, supabase);
  if (!isNameAvailable) {
    return { ok: false, error: "Ese nombre ya existe. Prueba con otro." };
  }

  slug = slug || slugify(name);
  if (!slug) return { ok: false, error: "El slug es obligatorio." };

  // 🔹 Asegurar slug único
  slug = await generateUniqueSlug(slug, supabase);

  // 🔹 Buscar el owner por clerk_id
  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .select("id")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (ownerError || !owner) {
    return {
      ok: false,
      error: "No se encontró el propietario en la tabla owners.",
    };
  }

  // 🔹 Buscar el profile por clerk_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      ok: false,
      error: "No se encontró el perfil en la tabla profiles.",
    };
  }

  // 🔹 Subir logo si existe
  let logoUrl = null;
  if (file && file.size > 0) {
    logoUrl = await uploadLogo(file, supabase, slug, userId);
  }

  // 🔹 Insertar negocio
  const { data, error } = await supabase
    .from("businesses")
    .insert([
      {
        name,
        slug,
        phone,
        email,
        description,
        logo_url: logoUrl, // 👈 guardamos la URL del logo
        owner_clerk_id: userId,
        owner_id: owner.id,
        created_by: profile.id,
      },
    ])
    .select("id, slug")
    .single();

  if (error) {
    const msg = /duplicate|unique/i.test(error.message)
      ? "Ese slug ya existe. Prueba con otro."
      : error.message;
    return { ok: false, error: msg };
  }

  return { ok: true, id: data.id, slug: data.slug };
}

export async function createOwnerBusinessAction(prevState, formData) {
  const res = await createOwnerBusiness(formData);
  if (!res.ok) return { error: res.error };
  redirect("/dashboard/owner/businesses");
}
