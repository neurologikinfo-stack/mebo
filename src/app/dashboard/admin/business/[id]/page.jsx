import { supabaseServer } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function BusinessDetailPage({ params }) {
  const supabase = supabaseServer()
  const { id } = params

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, slug, email, phone, description, created_at, logo_url, deleted_at')
    .eq('id', id)
    .single()

  if (error || !business) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold text-destructive">Negocio no encontrado</h1>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4 bg-card rounded-xl shadow border border-border">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{business.name}</h1>
        {business.deleted_at ? (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
            Inactivo
          </span>
        ) : (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
            Activo
          </span>
        )}
      </div>

      {/* Logo con fallback */}
      <img
        src={business.logo_url || '/default-business.png'}
        alt={`Logo de ${business.name}`}
        className="w-24 h-24 object-contain mb-4 border rounded-lg bg-muted"
      />

      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Slug:</span> {business.slug}
        </p>
        <p>
          <span className="font-medium text-foreground">Teléfono:</span> {business.phone || 'N/A'}
        </p>
        <p>
          <span className="font-medium text-foreground">Email:</span> {business.email || 'N/A'}
        </p>
        <p>
          <span className="font-medium text-foreground">Descripción:</span>{' '}
          {business.description || 'N/A'}
        </p>
        <p>
          <span className="font-medium text-foreground">Creado:</span>{' '}
          {new Date(business.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-2 mt-6">
        <Link
          href={`/dashboard/admin/business/${business.id}/edit`}
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90"
        >
          Editar
        </Link>
        <Link
          href="/dashboard/admin/business"
          className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Volver
        </Link>
      </div>
    </main>
  )
}
