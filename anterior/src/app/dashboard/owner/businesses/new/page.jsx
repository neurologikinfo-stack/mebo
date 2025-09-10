"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useState, useEffect } from "react";
import { createOwnerBusinessAction } from "../actions";
import { supabase } from "@/utils/supabase/client";

// función slugify local
function makeSlug(s) {
  return s
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function NewOwnerBusinessPage() {
  const [state, formAction, isPending] = useActionState(
    createOwnerBusinessAction,
    { error: "" }
  );

  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState(null); // "available" | "taken" | null

  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState(null); // "available" | "taken" | null

  // Generar slug cuando cambia el nombre
  useEffect(() => {
    const generated = makeSlug(name);
    setSlug(generated);
  }, [name]);

  // Verificar disponibilidad del nombre
  useEffect(() => {
    if (!name) {
      setNameStatus(null);
      return;
    }

    const checkName = setTimeout(async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("name", name)
        .maybeSingle();

      if (error) {
        setNameStatus(null);
      } else if (data) {
        setNameStatus("taken");
      } else {
        setNameStatus("available");
      }
    }, 400); // debounce

    return () => clearTimeout(checkName);
  }, [name]);

  // Verificar disponibilidad del slug
  useEffect(() => {
    if (!slug) {
      setSlugStatus(null);
      return;
    }

    const checkSlug = setTimeout(async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        setSlugStatus(null);
      } else if (data) {
        setSlugStatus("taken");
      } else {
        setSlugStatus("available");
      }
    }, 400); // debounce

    return () => clearTimeout(checkSlug);
  }, [slug]);

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Nuevo negocio</h1>

      {state?.error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-3">
        {/* Nombre */}
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          {nameStatus === "available" && (
            <p className="text-xs text-green-600 mt-1">✅ Disponible</p>
          )}
          {nameStatus === "taken" && (
            <p className="text-xs text-red-600 mt-1">
              ❌ Ya existe este nombre
            </p>
          )}
        </label>

        {/* Slug autogenerado + validación */}
        <label className="block">
          <span className="text-sm font-medium">Slug</span>
          <input
            name="slug"
            type="text"
            value={slug}
            readOnly
            className="mt-1 w-full rounded border px-3 py-2 bg-gray-100 text-gray-600"
          />
          {slugStatus === "available" && (
            <p className="text-xs text-green-600 mt-1">✅ Disponible</p>
          )}
          {slugStatus === "taken" && (
            <p className="text-xs text-red-600 mt-1">❌ Ya está en uso</p>
          )}
        </label>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="phone" label="Teléfono" />
          <Field name="email" label="Email" type="email" />
        </div>

        <Textarea name="description" label="Descripción" rows={4} />

        <FileField name="logo" label="Logo del negocio" />

        <div className="flex gap-2">
          <button
            disabled={
              isPending || slugStatus === "taken" || nameStatus === "taken"
            }
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Guardar"}
          </button>
          <Link
            href="/dashboard/owner/businesses"
            className="rounded border px-4 py-2"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}

function Field({ label, name, type = "text", required }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </label>
  );
}

function Textarea({ label, name, rows = 3 }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        rows={rows}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </label>
  );
}

function FileField({ label, name }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="file"
        name={name}
        accept="image/*"
        className="mt-1 block w-full text-sm text-gray-600"
      />
    </label>
  );
}
