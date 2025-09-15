'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function TestUI() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center gap-6 p-10">
      <h1 className="text-3xl font-bold">🧩 Test UI Components</h1>

      {/* Botones */}
      <div className="flex gap-4">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
      </div>

      {/* Card */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Card de prueba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Tu nombre" />
          <Input type="email" placeholder="Correo electrónico" />
          <Button className="w-full">Enviar</Button>
        </CardContent>
      </Card>

      {/* Toggle Dark Mode */}
      <Button variant="outline" onClick={() => document.documentElement.classList.toggle('dark')}>
        Toggle Dark Mode 🌙
      </Button>
    </div>
  )
}
