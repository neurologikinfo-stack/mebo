"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function OwnerBusinessDetail() {
  const { user } = useUser();
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    phone: "",
    email: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user || !id) return;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, phone, email, description, owner_clerk_id")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setError("No se encontró el negocio.");
      } else if (data.owner_clerk_id !== user.id) {
        setError("No tienes permiso para editar este negocio.");
      } else {
        setForm({
          name: data.name,
          slug: data.slug,
          phone: data.phone || "",
          email: data.email || "",
          description: data.description || "",
        });
      }

      setLoading(false);
    })();
  }, [user, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error } = await supabase
      .from("businesses")
      .update({
        name: form.name,
        phone: form.phone,
        email: form.email,
        description: form.description,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Negocio actualizado ✅");
      setTimeout(() => router.push("/dashboard/owner/businesses"), 1200);
    }

    setLoading(false);
  };

  if (loading) return <p className="p-6">Cargando…</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Editar negocio</h1>

      {error && (
        <p className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}
      {success && (
        <p className="mb-4 text-green-600 bg-green-50 p-3 rounded">{success}</p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Slug (no editable)
          </label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            disabled
            className="mt-1 w-full rounded border px-3 py-2 bg-gray-100 text-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/owner/businesses")}
            className="rounded border px-4 py-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
