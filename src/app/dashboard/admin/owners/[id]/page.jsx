'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function OwnerDetailPage() {
  const { id } = useParams()
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    if (!id) return
    fetchOwner()
  }, [id])

  async function fetchOwner() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/owners/${id}`)
      const result = await res.json()
      if (!res.ok || !result.ok) throw new Error(result.error)
      setOwner(result.data)
    } catch (err) {
      console.error('❌ Error cargando owner:', err)
      toast.error(err.message || 'Error cargando owner')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleBusiness(businessId, deletedAt) {
    setProcessingId(businessId)
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedAt }),
      })
      const result = await res.json()
      if (!result.ok) throw new Error(result.error)
      toast.success('Estado del negocio actualizado')
      fetchOwner() // refresca lista
    } catch (err) {
      console.error('❌ Error actualizando negocio:', err)
      toast.error(err.message || 'Error actualizando negocio')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <p className="p-6">⏳ Cargando owner...</p>
  if (!owner) return <p className="p-6">Owner no encontrado</p>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalle del Owner</h1>
        <Link
          href={`/dashboard/admin/owners/${id}/edit`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition"
        >
          Editar
        </Link>
      </div>

      {/* Card con info del Owner */}
      <div className="rounded-lg border text-card-foreground shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={owner.avatar_url || '/default-avatar.png'}
            alt={owner.full_name}
            className="w-16 h-16 rounded-full object-cover border"
          />
          <div>
            <p className="text-xl font-semibold">{owner.full_name || '—'}</p>
            <p className="text-sm text-muted-foreground">{owner.email || '—'}</p>
          </div>
        </div>

        <p>
          <strong>Status:</strong>{' '}
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              owner.status === 'confirmed'
                ? 'bg-green-100 text-green-700'
                : owner.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {owner.status || 'sin estado'}
          </span>
        </p>
        <p>
          <strong>Creado:</strong>{' '}
          {owner.created_at ? new Date(owner.created_at).toLocaleString() : '—'}
        </p>
      </div>

      {/* Lista de negocios */}
      <div className="rounded-lg border text-card-foreground shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Negocios del Owner</h2>
        {owner.businesses?.length > 0 ? (
          <ul className="divide-y divide-border">
            {owner.businesses.map((b) => (
              <li
                key={b.id}
                className="py-3 flex justify-between items-center hover:bg-muted/50 px-3 rounded"
              >
                <Link
                  href={`/dashboard/admin/business/${b.id}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src={b.logo_url || '/default-business.png'}
                    alt={b.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.email || '—'} | {b.phone || '—'}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      b.deleted_at ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {b.deleted_at ? 'Inactivo' : 'Activo'}
                  </span>
                  <button
                    onClick={() => handleToggleBusiness(b.id, b.deleted_at)}
                    disabled={processingId === b.id}
                    className={`px-3 py-1 text-xs rounded ${
                      b.deleted_at
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-destructive text-destructive-foreground hover:opacity-90'
                    } disabled:opacity-50`}
                  >
                    {processingId === b.id
                      ? b.deleted_at
                        ? 'Activando...'
                        : 'Desactivando...'
                      : b.deleted_at
                      ? 'Activar'
                      : 'Desactivar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Este owner no tiene negocios registrados.</p>
        )}
      </div>
    </div>
  )
}
