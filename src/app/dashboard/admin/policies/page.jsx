'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)

  // Campos del formulario
  const [form, setForm] = useState({
    policyname: '',
    cmd: 'SELECT',
    roles: '{authenticated}',
    permissive: 'PERMISSIVE',
  })

  async function fetchPolicies() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/policies')
      const result = await res.json()
      if (result.ok) {
        setPolicies(result.data)
      } else {
        toast.error(result.error || 'Error cargando policies')
      }
    } catch (err) {
      console.error('❌ Error:', err)
      toast.error('Error cargando policies')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Seguro que deseas eliminar esta policy?')) return
    try {
      const res = await fetch(`/api/admin/policies?id=${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.ok) {
        toast.success('✅ Policy eliminada')
        fetchPolicies()
      } else {
        toast.error(result.error || 'Error eliminando policy')
      }
    } catch (err) {
      toast.error('Error eliminando policy')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await res.json()
      if (result.ok) {
        toast.success('✅ Policy creada')
        setOpenModal(false)
        setForm({
          policyname: '',
          cmd: 'SELECT',
          roles: '{authenticated}',
          permissive: 'PERMISSIVE',
        })
        fetchPolicies()
      } else {
        toast.error(result.error || 'Error creando policy')
      }
    } catch (err) {
      toast.error('Error creando policy')
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl">Policies</CardTitle>
          <Button
            onClick={() => setOpenModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            ➕ Nueva Policy
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">⏳ Cargando...</p>
          ) : policies.length === 0 ? (
            <p className="text-muted-foreground">No hay policies registradas</p>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Policy Name</th>
                  <th className="p-2">Cmd</th>
                  <th className="p-2">Roles</th>
                  <th className="p-2">Permissive</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{p.id}</td>
                    <td className="p-2">{p.policyname}</td>
                    <td className="p-2">{p.cmd}</td>
                    <td className="p-2">{Array.isArray(p.roles) ? p.roles.join(', ') : p.roles}</td>
                    <td className="p-2">{p.permissive}</td>
                    <td className="p-2">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal crear policy */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Nueva Policy</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                placeholder="Policy name"
                value={form.policyname}
                onChange={(e) => setForm({ ...form, policyname: e.target.value })}
              />

              {/* Select Cmd */}
              <select
                value={form.cmd}
                onChange={(e) => setForm({ ...form, cmd: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm bg-background"
              >
                <option value="SELECT">SELECT</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>

              {/* Roles */}
              <Input
                placeholder="Roles (ej: {authenticated})"
                value={form.roles}
                onChange={(e) => setForm({ ...form, roles: e.target.value })}
              />

              {/* Select Permissive */}
              <select
                value={form.permissive}
                onChange={(e) => setForm({ ...form, permissive: e.target.value })}
                className="w-full border rounded px-2 py-1 text-sm bg-background"
              >
                <option value="PERMISSIVE">PERMISSIVE</option>
                <option value="RESTRICTIVE">RESTRICTIVE</option>
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
