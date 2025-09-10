"use server";

import { supabaseServer } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// ==========================
// Helpers
// ==========================
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
// CREATE
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

  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  slug = await generateUniqueSlug(slug, supabase);

  const { data, error } = await supabase
    .from("businesses")
    .insert([{ name, slug, phone, email, description, created_by: userId }])
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

// ==========================
// UPDATE
// ==========================
async function updateBusiness(id, formData) {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Debes iniciar sesión." };

  const supabase = supabaseServer();

  const name = formData.get("name")?.trim();
  const phone = formData.get("phone")?.trim() || null;
  const email = formData.get("email")?.trim() || null;
  const description = formData.get("description")?.trim() || null;

  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  const { error } = await supabase
    .from("businesses")
    .update({ name, phone, email, description })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateBusinessAction(id, prevState, formData) {
  const res = await updateBusiness(id, formData);
  if (!res.ok) return { error: res.error };
  redirect(`/dashboard/admin/business/${id}`);
}

// ==========================
// DELETE
// ==========================
async function deleteBusiness(id) {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Debes iniciar sesión." };

  const supabase = supabaseServer();

  const { error } = await supabase.from("businesses").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteBusinessAction(id) {
  const res = await deleteBusiness(id);
  if (!res.ok) return { error: res.error };
  redirect("/dashboard/admin/business");
}
