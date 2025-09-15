'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setErr('')
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `id, starts_at, ends_at, status,
           services(name), staff(name), customers(name), businesses(name)`
        )
        .order('starts_at', { ascending: false })

      if (error) setErr(error.message)
      else setAppointments(data ?? [])

      setLoading(false)
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Todas las citas (Admin)</h1>
      {loading && <p>Cargando...</p>}
      {err && <p className="text-red-600">{err}</p>}
      <ul className="divide-y">
        {appointments.map((a) => (
          <li key={a.id} className="py-3">
            <strong>{a.services?.name}</strong> con {a.customers?.name} ·{' '}
            {a.staff?.name || 'Sin técnico'} <br />
            <span className="text-sm text-gray-500">{a.businesses?.name}</span> ·{' '}
            {new Date(a.starts_at).toLocaleString()} ({a.status})
          </li>
        ))}
      </ul>
    </div>
  )
}
