"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createBusinessAction } from "../actions";
import { Button } from "@/components/ui/button";
import AddOwnerModal from "./AddOwnerModal";

export default function NewBusinessPageClient() {
  const [state, formAction, isPending] = useActionState(createBusinessAction, {
    error: "",
  });

  const [owners, setOwners] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  async function fetchOwners() {
    try {
      const res = await fetch("/api/admin/owners", { cache: "no-store" });
      const result = await res.json();
      if (result.ok) setOwners(result.data);
    } catch (err) {
      console.error("Error cargando owners:", err);
    }
  }

  function handleOwnerCreated(newOwner) {
    setOwners((prev) => [newOwner, ...prev]);
    setTimeout(() => {
      const select = document.querySelector("select[name='owner_id']");
      if (select) select.value = newOwner.id;
    }, 0);
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Nuevo negocio</h1>

      {state?.error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-3">
        <Field name="name" label="Nombre" required />
        <Field name="slug" label="Slug" />
        <Field name="phone" label="Teléfono" />
        <Field name="email" label="Email" type="email" />

        <Field name="address" label="Dirección" required />
        <Field name="city" label="Ciudad" required />
        <Field name="province" label="Provincia/Estado" />
        <Field name="postal_code" label="Código Postal" />
        <Field name="country" label="País" defaultValue="Canadá" />

        <div className="space-y-2">
          <label className="block">
            <span className="text-sm font-medium">Asignar a Owner</span>
            <select
              name="owner_id"
              required
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="">Selecciona un owner</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.full_name?.trim()
                    ? o.full_name
                    : o.email || `Owner #${o.id}`}
                </option>
              ))}
            </select>
          </label>

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
          <button
            disabled={isPending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Guardar"}
          </button>
          <Link
            href="/dashboard/admin/business"
            className="rounded border px-4 py-2"
          >
            Cancelar
          </Link>
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

function Field({ label, name, type = "text", required, defaultValue }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </label>
  );
}

function Textarea({ label, name, rows = 3, defaultValue }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </label>
  );
}
