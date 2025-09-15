'use client'

import Link from 'next/link'
import LogoUploader from './LogoUploader'
import { updateBusinessWithLogo, toggleBusinessStatus } from './actions'

export default function EditBusinessForm({ business, owners }) {
  const isInactive = !!business.deleted_at

  return (
    <form action={updateBusinessWithLogo.bind(null, business)} className="space-y-4">
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
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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

      {/* Logo */}
      <LogoUploader currentLogo={business.logo_url || '/default-business.png'} />

      <div className="flex gap-2 pt-4">
        <button className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90">
          Guardar
        </button>

        <Link
          href="/dashboard/owner/businesses"
          className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </Link>

        <button
          formAction={() => toggleBusinessStatus(business.id, business.deleted_at)}
          className={`rounded-lg px-4 py-2 text-sm font-medium shadow hover:opacity-90 ${
            isInactive
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {isInactive ? 'Activar' : 'Desactivar'}
        </button>
      </div>
    </form>
  )
}

/* Helpers */
function Field({ label, name, type = 'text', required, defaultValue }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  )
}

function Textarea({ label, name, rows = 3, defaultValue }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  )
}
