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

async function generateUniqueSlug(baseSlug, supabase) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

// ==========================
// CREATE (Admin)
// ==========================
async function createBusiness(formData) {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Debes iniciar sesión." };

  const supabase = supabaseServer();

  const name = formData.get("name")?.trim();
  let slug = formData.get("slug")?.trim() || slugify(name);
  const phone = formData.get("phone")?.trim() || null;
  const email = formData.get("email")?.trim() || null;
  const description = formData.get("description")?.trim() || null;

  // Ubicación
  const address = formData.get("address")?.trim() || null;
  const city = formData.get("city")?.trim() || null;
  const province = formData.get("province")?.trim() || null;
  const postal_code = formData.get("postal_code")?.trim() || null;
  const country = formData.get("country")?.trim() || null;
  const latitude = formData.get("latitude")?.trim() || null;
  const longitude = formData.get("longitude")?.trim() || null;

  // Owner seleccionado
  const ownerId = formData.get("owner_id");

  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  if (!ownerId) return { ok: false, error: "Debes asignar un propietario." };

  // Buscar datos del owner
  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .select("id, clerk_id")
    .eq("id", ownerId)
    .maybeSingle();

  if (ownerError || !owner) {
    return { ok: false, error: "No se encontró el owner seleccionado." };
  }

  // Buscar profile del owner
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", owner.clerk_id)
    .maybeSingle();

  if (profileError || !profile) {
    return { ok: false, error: "No se encontró el profile del owner." };
  }

  slug = await generateUniqueSlug(slug, supabase);

  const { data, error } = await supabase
    .from("businesses")
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
        latitude,
        longitude,
        owner_id: owner.id,
        owner_clerk_id: owner.clerk_id,
        created_by: profile.id, // 👈 el profile del owner
      },
    ])
    .select("id, slug")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id, slug: data.slug };
}

export async function createBusinessAction(prevState, formData) {
  const res = await createBusiness(formData);
  if (!res.ok) return { error: res.error };
  redirect("/dashboard/admin/business");
}
