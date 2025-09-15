import { supabaseServer } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function BusinessDetailPage({ params }) {
  const supabase = supabaseServer()
  const { id } = params

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, slug, email, phone, description, created_at, logo_url')
    .eq('id', id)
    .single()

  if (error || !business) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold">Negocio no encontrado</h1>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">{business.name}</h1>

      {/* Logo */}
      {business.logo_url && (
        <img
          src={business.logo_url}
          alt={`Logo de ${business.name}`}
          className="w-24 h-24 object-contain mb-4 border rounded"
        />
      )}

      <p className="text-gray-600">Slug: {business.slug}</p>
      <p className="text-gray-600">Teléfono: {business.phone || 'N/A'}</p>
      <p className="text-gray-600">Email: {business.email || 'N/A'}</p>
      <p className="text-gray-600">Descripción: {business.description || 'N/A'}</p>
      <p className="text-gray-600">Creado: {new Date(business.created_at).toLocaleDateString()}</p>

      <div className="flex gap-2 mt-4">
        <Link
          href={`/dashboard/admin/business/${business.id}/edit`}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Editar
        </Link>
        <Link href="/dashboard/admin/business" className="rounded border px-4 py-2">
          Volver
        </Link>
      </div>
    </main>
  )
}
