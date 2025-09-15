'use client'

import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { useState } from 'react'

export default function TestColorsPage() {
  const [date, setDate] = useState(new Date())

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-6">
      {/* Encabezado */}
      <h1 className="text-3xl font-bold">🎨 Test Tailwind + Variables</h1>
      <p className="text-muted-foreground">Modo claro/oscuro y colores personalizados</p>

      {/* Bloques de colores */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="p-4 rounded-lg bg-primary text-primary-foreground">Primary</div>
        <div className="p-4 rounded-lg bg-secondary text-secondary-foreground">Secondary</div>
        <div className="p-4 rounded-lg bg-accent text-accent-foreground">Accent</div>
        <div className="p-4 rounded-lg bg-destructive text-destructive-foreground">Destructive</div>
        <div className="p-4 rounded-lg bg-card text-card-foreground">Card</div>
        <div className="p-4 rounded-lg bg-popover text-popover-foreground">Popover</div>
      </div>

      {/* Calendario DayPicker */}
      <div className="w-full max-w-md border rounded-lg p-4">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={{ before: new Date() }}
        />
      </div>

      {/* Toggle manual para probar dark mode */}
      <button
        className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground"
        onClick={() => document.documentElement.classList.toggle('dark')}
      >
        Toggle Dark Mode 🌙
      </button>
    </div>
  )
}
