'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/utils/supabase/client'
import { CalendarDays, CheckCircle, XCircle } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

export default function BookPage() {
  const { slug } = useParams()
  const { user } = useUser()
  const router = useRouter()

  const [biz, setBiz] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null) // 👈 para debug

  useEffect(() => {
    if (!slug) {
      setErrorMsg('⚠️ Slug no recibido aún')
      return
    }

    console.log('🔎 Slug recibido:', slug)
    ;(async () => {
      const { data: b, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('❌ Error cargando negocio:', error)
        setErrorMsg(`Error cargando negocio: ${error.message}`)
      } else if (!b) {
        setErrorMsg('⚠️ No se encontró negocio con ese slug')
      } else {
        setBiz(b)
        setErrorMsg(null)
      }
    })()
  }, [slug])

  if (errorMsg) {
    return <div className="p-6 text-red-600">{errorMsg}</div>
  }

  if (!biz) return <div className="p-6">Cargando negocio…</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Reserva en {biz.name}</h1>
      <p className="text-gray-600">Slug: {slug}</p>
      <p className="text-gray-600">ID negocio: {biz.id}</p>
      {/* 👆 Ahora puedes ver que sí se cargó */}
    </div>
  )
}
