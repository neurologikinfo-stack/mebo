'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, slug, description, logo_url')
      if (!error) setBusinesses(data || [])
      setLoading(false)
    })()
  }, [])

  if (loading) return <SkeletonGrid />

  if (businesses.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">No hay negocios disponibles</h2>
        <p className="text-gray-500">Pronto verás aquí los negocios activos.</p>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Negocios</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((b) => (
          <Card key={b.id} className="hover:shadow-md transition overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.name}
                    className="h-12 w-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                    {b.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <CardTitle className="truncate">{b.name}</CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              {b.description ? (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {b.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400">Sin descripción</p>
              )}
            </CardContent>

            <CardFooter>
              <Link href={`/${b.slug}/book`} className="w-full">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-500">Book</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
