"use client";

import useProfile from "@/hooks/useProfile";
import { useState, useEffect } from "react";

export default function OwnerProfilePage() {
  const { profile, loading, error, saving, saveProfile, uploadAvatar } =
    useProfile();
  const [localProfile, setLocalProfile] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ sincronizar el perfil cargado desde el hook a localProfile
  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  async function handleSave(e) {
    e.preventDefault();
    if (!localProfile) return;

    try {
      await saveProfile(localProfile);
      setMessage("✅ Perfil actualizado correctamente");
    } catch (err) {
      setMessage("❌ Error al guardar: " + err.message);
    } finally {
      setTimeout(() => setMessage(""), 4000);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const res = await uploadAvatar(file);
    if (res.ok) {
      setLocalProfile((prev) => ({ ...prev, avatar_url: res.avatar_url }));
      setMessage("✅ Avatar actualizado");
    } else {
      setMessage("❌ Error al subir avatar: " + res.error);
    }
    setTimeout(() => setMessage(""), 4000);
  }

  if (loading)
    return <p className="text-muted-foreground">⏳ Cargando perfil...</p>;
  if (error) return <p className="text-red-600">❌ {error}</p>;
  if (!localProfile) return null;

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Perfil Propietario</h1>

      {message && (
        <p
          className={`text-sm ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <img
            src={localProfile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            className="w-20 h-20 rounded-full border object-cover"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cambiar avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="mt-1 block text-sm"
            />
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <input
            type="text"
            value={localProfile.full_name}
            onChange={(e) =>
              setLocalProfile({ ...localProfile, full_name: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={localProfile.email}
            disabled
            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 shadow-sm"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            type="text"
            value={localProfile.phone || ""}
            onChange={(e) =>
              setLocalProfile({ ...localProfile, phone: e.target.value })
            }
            placeholder="+1 506 555 1234"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow hover:bg-blue-500 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
