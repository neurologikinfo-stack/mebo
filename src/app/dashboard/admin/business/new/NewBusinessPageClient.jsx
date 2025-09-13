"use client";

import Link from "next/link";
import { useActionState } from "react"; // ✅ FIX React 19
import { createBusinessAction } from "../actions";
import { Button } from "@/components/ui/button";
import AddOwnerModal from "@/components/AddOwnerModal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase/client"; // 👈 usamos Supabase directo

// 🔹 función para generar slug
function makeSlug(s) {
  return s
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function NewBusinessPageClient() {
  const [state, formAction, isPending] = useActionState(createBusinessAction, {
    error: "",
  });

  const [owners, setOwners] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState("");

  // 🔹 estados para validación en vivo
  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState(null);

  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  async function fetchOwners() {
    try {
      const res = await fetch("/api/admin/owners", { cache: "no-store" });
      const result = await res.json();
      if (result.ok) setOwners(result.data);
    } catch (err) {
      console.error("❌ Error cargando owners:", err);
      toast.error("No se pudieron cargar los owners");
    }
  }

  function handleOwnerCreated(newOwner) {
    setOwners((prev) => [newOwner, ...prev]);
    setSelectedOwner(newOwner.id);
    toast.success("✅ Nuevo owner invitado");
  }

  // 🔹 generar slug automáticamente
  useEffect(() => {
    const generated = makeSlug(name);
    setSlug(generated);
  }, [name]);

  // 🔹 validar nombre en Supabase
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
    }, 400);

    return () => clearTimeout(checkName);
  }, [name]);

  // 🔹 validar slug en Supabase
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
    }, 400);

    return () => clearTimeout(checkSlug);
  }, [slug]);

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Nuevo negocio</h1>

      {state?.error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Nombre */}
        <label className="block space-y-1">
          <span className="text-sm font-medium">Nombre</span>
          <input
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2"
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

        {/* Slug */}
        <label className="block space-y-1">
          <span className="text-sm font-medium">Slug</span>
          <input
            name="slug"
            type="text"
            value={slug}
            readOnly
            className="mt-1 w-full rounded border border-input bg-gray-100 px-3 py-2 text-gray-600"
          />
          {slugStatus === "available" && (
            <p className="text-xs text-green-600 mt-1">✅ Disponible</p>
          )}
          {slugStatus === "taken" && (
            <p className="text-xs text-red-600 mt-1">❌ Ya está en uso</p>
          )}
        </label>

        <Field name="phone" label="Teléfono" />
        <Field name="email" label="Email" type="email" />
        <Field name="address" label="Dirección" required />
        <Field name="city" label="Ciudad" required />
        <Field name="province" label="Provincia/Estado" />
        <Field name="postal_code" label="Código Postal" />
        <Field name="country" label="País" defaultValue="Canadá" />

        {/* Asignar Owner */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Asignar a Owner</label>
          <select
            name="owner_id"
            required
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2 focus:ring-2 focus:ring-ring"
          >
            <option value="">Selecciona un owner</option>
            {owners.length === 0 ? (
              <option disabled>Cargando...</option>
            ) : (
              owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.full_name?.trim()
                    ? o.full_name
                    : o.email || `Owner #${o.id}`}
                </option>
              ))
            )}
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={() => setModalOpen(true)}
          >
            + Invitar nuevo Owner
          </Button>
        </div>

        <Textarea name="description" label="Descripción" rows={4} />

        <div className="flex gap-2">
          <SubmitButton
            pending={isPending}
            disabled={nameStatus === "taken" || slugStatus === "taken"}
          />
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/business">Cancelar</Link>
          </Button>
        </div>
      </form>

      <AddOwnerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleOwnerCreated}
      />
    </main>
  );
}

/* 🔹 Botón con estado pending */
function SubmitButton({ disabled, pending }) {
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Guardando…" : "Guardar"}
    </Button>
  );
}

/* 🔹 Input genérico */
function Field({ label, name, type = "text", required, defaultValue }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border border-input bg-background px-3 py-2 focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

/* 🔹 Textarea genérico */
function Textarea({ label, name, rows = 3, defaultValue }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border border-input bg-background px-3 py-2 focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
