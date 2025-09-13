"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditOwnerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    status: "pending",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          avatar_url: result.data.avatar_url || "",
        });
      } catch (err) {
        console.error("❌ Error cargando owner:", err);
        toast.error(err.message || "Error cargando owner");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/owners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error);

      toast.success("✅ Cambios guardados correctamente");
      router.push(`/dashboard/admin/owners/${id}`);
    } catch (err) {
      console.error("❌ Error guardando cambios:", err);
      toast.error(err.message || "Error guardando cambios");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6">⏳ Cargando...</p>;

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Editar Owner</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar + URL */}
        <div className="flex items-center gap-4">
          <img
            src={form.avatar_url || "/default-avatar.png"}
            alt={form.full_name}
            className="w-16 h-16 rounded-full object-cover border"
          />
          <input
            type="url"
            placeholder="URL del avatar"
            value={form.avatar_url}
            onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
            className="mt-1 w-full px-3 py-2 border rounded text-black"
          />
        </div>

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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
