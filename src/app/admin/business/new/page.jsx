"use client";

import Link from "next/link";
import { useActionState } from "react"; // ✅ actualizado
import { createBusinessAction } from "../actions";

export default function NewBusinessPage() {
  const [state, formAction, isPending] = useActionState(createBusinessAction, {
    error: "",
  });

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
        <Field
          name="slug"
          label="Slug"
          hint="sin espacios, único (si lo dejas vacío, lo genero desde el nombre)"
        />
        <Field name="phone" label="Teléfono" />
        <Field name="email" label="Email" type="email" />
        <Textarea name="description" label="Descripción" rows={4} />

        <div className="flex gap-2">
          <button
            disabled={isPending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Guardar"}
          </button>
          <Link href="/admin/business" className="rounded border px-4 py-2">
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}

function Field({ label, name, type = "text", required, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded border px-3 py-2"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
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
