import { supabaseServer } from '@/utils/supabase/server'
import { updateBusinessWithLogo, removeBusiness } from './actions'
import Link from 'next/link'
import LogoUploader from './LogoUploader' // 👈 nuevo componente cliente

export default async function EditBusinessPage({ params }) {
  const supabase = supabaseServer()
  const { id } = params

  const { data: b, error } = await supabase
    .from('businesses')
    .select('id,name,slug,phone,email,description,logo_url')
    .eq('id', id)
    .single()

  if (error || !b) {
    return <div className="p-6">Negocio no encontrado</div>
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Editar negocio</h1>

      {/* FORMULARIO EDITAR */}
      <form
        action={async (formData) => {
          'use server'
          await updateBusinessWithLogo(b, formData)
        }}
        className="space-y-3"
      >
        <Field name="name" label="Nombre" defaultValue={b.name} required />
        <Field name="slug" label="Slug" defaultValue={b.slug} required />
        <Field name="phone" label="Teléfono" defaultValue={b.phone || ''} />
        <Field name="email" label="Email" type="email" defaultValue={b.email || ''} />
        <Textarea
          name="description"
          label="Descripción"
          rows={4}
          defaultValue={b.description || ''}
        />

        {/* Campo logo con preview */}
        <LogoUploader currentLogo={b.logo_url} />

        <div className="flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white">Guardar</button>
          <Link href="/dashboard/admin/business" className="rounded border px-4 py-2">
            Cancelar
          </Link>
          <button
            formAction={async () => {
              'use server'
              await removeBusiness(b.id)
            }}
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
