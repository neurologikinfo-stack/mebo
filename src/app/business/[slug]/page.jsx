'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function BusinessDetailPage() {
  const { slug } = useParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      const { data } = await supabase
        .from('businesses')
        .select(
          `
          id,
          name,
          slug,
          email,
          phone,
          description,
          logo_url,
          created_at,
          address,
          city,
          province,
          postal_code,
          country,
          latitude,
          longitude
        `
        )
        .eq('slug', slug)
        .maybeSingle()

      setBusiness(data)
      setLoading(false)
    })()
  }, [slug])

  if (loading) return <div className="p-6">Cargando negocio...</div>
  if (!business) return <div className="p-6">Negocio no encontrado</div>

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header con logo y CTA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-20 w-20 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
              {business.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{business.name}</h1>
            <p className="text-sm text-muted-foreground">@{business.slug}</p>
          </div>
        </div>

        <Link href={`/${business.slug}/book`}>
          <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-500">
            Reservar cita
          </Button>
        </Link>
      </div>

      {/* Info principal */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <h2 className="font-semibold text-lg mb-2">Contacto</h2>
            <p>
              <strong>Email:</strong> {business.email || '—'}
            </p>
            <p>
              <strong>Teléfono:</strong> {business.phone || '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <h2 className="font-semibold text-lg mb-2">Ubicación</h2>
            <p>{business.address || 'Dirección no disponible'}</p>
            <p>
              {business.city || '—'}, {business.province || '—'}
            </p>
            <p>
              {business.postal_code || '—'}, {business.country || '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Descripción */}
      <Card>
        <CardContent className="p-4 text-sm">
          <h2 className="font-semibold text-lg mb-2">Descripción</h2>
          <p>{business.description || 'Este negocio aún no tiene descripción registrada.'}</p>
          <p className="text-xs text-muted-foreground mt-4">
            Creado el {new Date(business.created_at).toLocaleDateString('es-ES')}
          </p>
        </CardContent>
      </Card>

      {/* Mapa */}
      {business.latitude && business.longitude && (
        <div className="rounded-lg overflow-hidden shadow">
          <iframe
            title="mapa"
            width="100%"
            height="350"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${business.latitude},${business.longitude}&hl=es&z=14&output=embed`}
          ></iframe>
        </div>
      )}
    </main>
  )
}
