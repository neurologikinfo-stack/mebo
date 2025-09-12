"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditOwnerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({ full_name: "", email: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/owners/${id}`);
        const result = await res.json();
        if (!res.ok || !result.ok) throw new Error(result.error);

        setForm({
          full_name: result.data.full_name || "",
          email: result.data.email || "",
          status: result.data.status || "pending",
        });
      } catch (err) {
        console.error("❌ Error cargando owner:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/owners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error);

      router.push(`/dashboard/admin/owners/${id}`);
    } catch (err) {
      console.error("❌ Error guardando cambios:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este owner?")) return;

    try {
      const res = await fetch(`/api/admin/owners/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error);

      router.push("/dashboard/admin/owners");
    } catch (err) {
      console.error("❌ Error eliminando owner:", err);
      setError(err.message);
    }
  }

  if (loading) return <p className="p-6">⏳ Cargando...</p>;
  if (error) return <p className="p-6 text-red-500">❌ {error}</p>;

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Editar Owner</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre completo</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            className="mt-1 w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="mt-1 w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="mt-1 w-full px-3 py-2 border rounded text-black"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </form>
    </div>
  );
}
