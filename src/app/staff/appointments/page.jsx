'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/utils/supabase/client'

export default function StaffAppointmentsPage() {
  const { user } = useUser()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      setErr('')

      // Buscar staff vinculado al clerk_id
      const { data: staff } = await supabase
        .from('staff')
        .select('id')
        .eq('clerk_id', user.id)
        .maybeSingle()

      if (!staff) {
        setErr('No se encontró técnico asociado')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `id, starts_at, ends_at, status,
           services(name), customers(name), businesses(name)`
        )
        .eq('staff_id', staff.id)
        .order('starts_at', { ascending: false })

      if (error) setErr(error.message)
      else setAppointments(data ?? [])

      setLoading(false)
    })()
  }, [user])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis citas como técnico</h1>
      {loading && <p>Cargando...</p>}
      {err && <p className="text-red-600">{err}</p>}
      <ul className="divide-y">
        {appointments.map((a) => (
          <li key={a.id} className="py-3">
            <strong>{a.services?.name}</strong> con {a.customers?.name} <br />
            <span className="text-sm text-gray-500">{a.businesses?.name}</span> ·{' '}
            {new Date(a.starts_at).toLocaleString()} ({a.status})
          </li>
        ))}
      </ul>
    </div>
  )
}
