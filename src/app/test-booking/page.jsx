'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { supabase } from '@/utils/supabase/client'

export default function TestBooking() {
  const [date, setDate] = useState(new Date())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleBooking() {
    if (!date || !name || !email) {
      setMessage({ type: 'error', text: 'Completa todos los campos' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // 1. Buscar o crear cliente
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      let customerId
      if (existing) {
        customerId = existing.id
      } else {
        const { data: newCustomer, error: custError } = await supabase
          .from('customers')
          .insert({ name, email })
          .select('id')
          .single()

        if (custError) throw custError
        customerId = newCustomer.id
      }

      // 2. Insertar cita (usamos IDs dummy para prueba)
      const { error: apptError } = await supabase.from('appointments').insert({
        business_id: 1, // 👈 cámbialo a un ID válido en tu DB
        staff_id: 1, // 👈 cámbialo a un ID válido en tu DB
        service_id: 1, // 👈 cámbialo a un ID válido en tu DB
        customer_id: customerId,
        starts_at: new Date(date.setHours(9, 0, 0)).toISOString(), // 9am fijo
        ends_at: new Date(date.setHours(10, 0, 0)).toISOString(), // 10am fijo
        status: 'confirmed',
      })

      if (apptError) throw apptError

      setMessage({ type: 'success', text: '✅ Cita confirmada con éxito' })
      setName('')
      setEmail('')
    } catch (err) {
      console.error('❌ Error booking:', err)
      setMessage({ type: 'error', text: 'Error al agendar cita' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center gap-8 p-8">
      <h1 className="text-3xl font-bold">📅 Test Booking Flow</h1>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Agendar cita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mensaje */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Selección de fecha */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Selecciona fecha</h2>
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={{ before: new Date() }}
              className="rounded-lg border p-2"
            />
          </div>

          {/* Datos del cliente */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Tus datos</h2>
            <div className="space-y-3">
              <Input
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Botón confirmar */}
          <Button
            className="w-full"
            disabled={!date || !name || !email || loading}
            onClick={handleBooking}
          >
            {loading ? 'Agendando...' : 'Confirmar cita'}
          </Button>
        </CardContent>
      </Card>

      {/* Toggle Dark Mode */}
      <Button variant="outline" onClick={() => document.documentElement.classList.toggle('dark')}>
        Toggle Dark Mode 🌙
      </Button>
    </div>
  )
}
