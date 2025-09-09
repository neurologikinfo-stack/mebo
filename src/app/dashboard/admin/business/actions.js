"use server";

import { supabaseServer } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

function slugify(s) {
  return s
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ==========================
// CREATE
// ==========================
export async function createBusiness(formData) {
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

  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  slug = slug || slugify(name);
  if (!slug) return { ok: false, error: "El slug es obligatorio." };

  const { data, error } = await supabase
    .from("businesses")
    .insert([{ name, slug, phone, email, description, owner_clerk_id: userId }])
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

export async function createBusinessAction(prevState, formData) {
  const res = await createBusiness(formData);
  if (!res.ok) return { error: res.error };
  redirect(`/dashboard/admin/business/${res.id}/edit`); // ✅ corregido
}

// ==========================
// UPDATE
// ==========================
export async function updateBusiness(id, formData) {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Debes iniciar sesión para editar un negocio." };
  }

  const supabase = supabaseServer();

  const name = formData.get("name")?.trim();
  let slug = formData.get("slug")?.trim();
  const phone = formData.get("phone")?.trim() || null;
  const email = formData.get("email")?.trim() || null;
  const description = formData.get("description")?.trim() || null;

  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  slug = slug || slugify(name);

  const { error } = await supabase
    .from("businesses")
    .update({ name, slug, phone, email, description })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ==========================
// DELETE
// ==========================
export async function deleteBusiness(id) {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      error: "Debes iniciar sesión para eliminar un negocio.",
    };
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("businesses").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
