'use client'

import Link from 'next/link'
import LogoUploader from './LogoUploader'
import { updateBusinessWithLogo, removeBusiness } from './actions'

export default function EditBusinessForm({ business, owners }) {
  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Editar negocio</h1>

      {/* Usa la server action directamente */}
      <form action={(formData) => updateAction(business, formData)} className="space-y-3">
        <Field name="name" label="Nombre" defaultValue={business.name} required />
        <Field name="slug" label="Slug" defaultValue={business.slug} required />
        <Field name="phone" label="Teléfono" defaultValue={business.phone || ''} />
        <Field name="email" label="Email" type="email" defaultValue={business.email || ''} />

        {/* Owner opcional */}
        <label className="block space-y-1">
          <span className="text-sm font-medium">(Opcional) Owner</span>
          <select
            name="owner_id"
            defaultValue={business.owner_id || ''}
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2"
          >
            <option value="">Sin owner asignado</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.full_name?.trim() ? o.full_name : o.email || `Owner #${o.id}`}
              </option>
            ))}
          </select>
        </label>

        <Textarea
          name="description"
          label="Descripción"
          rows={4}
          defaultValue={business.description || ''}
        />

        {/* Campo logo con preview */}
        <LogoUploader currentLogo={business.logo_url} />

        <div className="flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white">Guardar</button>
          <Link href="/dashboard/admin/business" className="rounded border px-4 py-2">
            Cancelar
          </Link>

          {/* Botón que usa la server action removeBusiness */}
          <button
            formAction={() => removeBusiness(business.id)}
            className="rounded border px-4 py-2 text-red-600 border-red-300"
          >
            Eliminar
          </button>
        </div>
      </form>
    </main>
  )
}

/* Helpers */
function Field({ label, name, type = 'text', required, defaultValue }) {
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
  )
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
  )
}
