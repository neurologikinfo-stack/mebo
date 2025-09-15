"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useAdminUser from "@/hooks/useAdminUser";
import { supabase } from "@/utils/supabase/client";

export default function EditUserPage() {
  const params = useParams();
  const clerk_id = params?.clerk_id
    ? decodeURIComponent(params.clerk_id)
    : null;
  const router = useRouter();

  const { user, loading, error, saving, saveUser } = useAdminUser(clerk_id);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "",
    phone: "",
    avatar_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        role: user.role || "user",
        phone: user.phone || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  // 🔹 Subir avatar a Supabase Storage
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("clerk_id", clerk_id);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error);

      setForm((prev) => ({ ...prev, avatar_url: result.url }));
    } catch (err) {
      console.error("❌ Error subiendo avatar:", err.message);
      setErr("Error al subir imagen: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setMessage("");

    try {
      const res = await saveUser(form);
      if (!res.ok) throw new Error(res.error || "No se pudo actualizar");

      setMessage("✅ Cambios guardados correctamente");
      router.push(`/dashboard/admin/users/${clerk_id}`);
    } catch (err) {
      console.error("❌ Error actualizando usuario:", err);
      setErr(err.message);
    }
  }

  if (!clerk_id) return <p className="p-6">⚠️ Falta clerk_id en la URL</p>;
  if (loading) return <p className="p-6">⏳ Cargando...</p>;
  if (error) return <p className="p-6 text-red-500">❌ {error}</p>;
  if (!user) return <p className="p-6">Usuario no encontrado</p>;

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Editar usuario</h1>

      {message && <p className="text-green-600">{message}</p>}
      {err && <p className="text-red-500">{err}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium">Foto de perfil</label>
          <div className="flex items-center gap-4 mt-2">
            <img
              src={form.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Nombre completo</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Rol</label>
          <input
            type="text"
            value={form.role}
            disabled
            className="mt-1 block w-full px-3 py-2 border rounded text-gray-500 bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1"></p>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {saving || uploading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
