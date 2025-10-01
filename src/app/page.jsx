'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()
  const userId = user?.id
  const isAdmin = user?.publicMetadata?.role === 'admin'
  const router = useRouter()

  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('created_desc')
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setErr('')

      let query = supabase
        .from('businesses')
        .select('id,name,slug,phone,email,created_at,description,created_by,logo_url')

      const term = q.trim()
      if (term) {
        query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%,description.ilike.%${term}%`)
      }

      if (sort === 'name_asc') query = query.order('name', { ascending: true })
      else if (sort === 'created_asc') query = query.order('created_at', { ascending: true })
      else query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        setErr(error.message || 'No se pudieron cargar los negocios.')
        setBusinesses([])
      } else {
        setBusinesses(Array.isArray(data) ? data : [])
      }
      setLoading(false)
    })()
  }, [q, sort])

  async function handleSync() {
    setSyncMsg('Sincronizando...')
    try {
      const res = await fetch('/api/backfill-clerk-profiles')
      const data = await res.json()
      setSyncMsg(data.message || data.error)
    } catch (err) {
      setSyncMsg('❌ Error en la sincronización')
    }
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Todos los Negocios</h1>
          <p className="text-sm text-muted-foreground">
            Listado completo desde tu base de datos en Supabase.
          </p>
        </div>
        {isLoaded && isSignedIn && isAdmin && (
          <Button
            onClick={handleSync}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Sincronizar Usuarios
          </Button>
        )}
      </div>

      {syncMsg && <p className="mb-4 text-sm text-green-600 font-medium">{syncMsg}</p>}

      {/* Grid */}
      <section>
        {loading ? (
          <SkeletonGrid />
        ) : businesses.length === 0 ? (
          <EmptyState hasQuery={!!q} clear={() => setQ('')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => (
              <Card
                key={b.id}
                className="cursor-pointer hover:shadow-md transition"
                onClick={() => router.push(`/business/${b.slug}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {b.logo_url ? (
                        <img
                          src={b.logo_url}
                          alt={b.name}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                          {b.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <CardTitle className="line-clamp-1">{b.name || 'Sin nombre'}</CardTitle>
                    </div>
                    <Badge variant="outline">{formatDate(b.created_at)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">@{b.slug}</p>
                </CardHeader>

                <CardContent>
                  {b.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground mb-2">
                      {b.description}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {b.phone && <p>📞 {b.phone}</p>}
                    {b.email && <p>✉️ {b.email}</p>}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  {isAdmin || b.created_by === userId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/admin/businesses/${b.id}/edit`)
                      }}
                    >
                      Editar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/${b.slug}/book`)
                      }}
                    >
                      Book
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

/* Helpers */
function formatDate(d) {
  if (!d) return '—'
  try {
    return new Intl.DateTimeFormat('es', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(d))
  } catch {
    return '—'
  }
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-28 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function EmptyState({ hasQuery, clear }) {
  const router = useRouter()
  return (
    <Card className="text-center py-10">
      <CardContent>
        <div className="text-4xl mb-2">🗂️</div>
        <h3 className="text-lg font-semibold">
          {hasQuery ? 'Sin resultados' : 'Aún no hay negocios'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasQuery
            ? 'Prueba con otro término o limpia el filtro.'
            : 'Crea tu primer negocio para empezar.'}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {hasQuery ? (
            <Button variant="outline" onClick={clear}>
              Limpiar búsqueda
            </Button>
          ) : (
            <Button onClick={() => router.push('/dashboard/admin/businesses/new')}>
              Crear negocio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
