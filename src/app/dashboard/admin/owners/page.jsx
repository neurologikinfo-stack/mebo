'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function OwnersPage() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/owners')
        const result = await res.json()
        if (!res.ok || !result.ok) throw new Error(result.error)
        setOwners(result.data)
      } catch (err) {
        console.error('❌ Error cargando owners:', err)
        toast.error(err.message || 'Error cargando owners')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <p className="p-6">⏳ Cargando owners...</p>
  if (owners.length === 0) return <p className="p-6">No hay owners registrados.</p>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Owners</h1>
        <Link
          href="/dashboard/admin/owners/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition"
        >
          + Nuevo Owner
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Avatar</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Negocios</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {owners.map((o) => (
              <tr
                key={o.id}
                className="hover:bg-muted/50 transition cursor-pointer"
                onClick={() => router.push(`/dashboard/admin/owners/${o.id}`)}
              >
                <td className="px-4 py-3">
                  <img
                    src={o.avatar_url || '/default-avatar.png'}
                    alt={o.full_name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{o.full_name || '—'}</td>
                <td className="px-4 py-3">{o.email || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      o.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : o.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {o.status || 'sin estado'}
                  </span>
                </td>
                <td className="px-4 py-3">{o.businesses_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
