"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";

export default function OwnerProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ cargar perfil
  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone, avatar_url")
        .eq("clerk_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.primaryEmailAddress?.emailAddress || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
        });
      } else {
        setProfile({
          full_name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
          phone: "",
          avatar_url: "",
        });
      }

      setLoading(false);
    })();
  }, [user]);

  // ✅ guardar cambios
  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    const { error } = await supabase.from("profiles").upsert(
      {
        clerk_id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      },
      { onConflict: ["clerk_id"] }
    );

    setSaving(false);

    if (error) {
      setMessage("❌ Error al guardar: " + error.message);
    } else {
      setMessage("✅ Perfil actualizado correctamente");
    }

    setTimeout(() => setMessage(""), 4000);
  }

  // ✅ subir avatar a Supabase Storage
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      setMessage("❌ Error al subir avatar: " + uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // actualizar BD
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("clerk_id", user.id);

    if (error) {
      setMessage("❌ Error al guardar avatar en BD");
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      setMessage("✅ Avatar actualizado");
    }
  }

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

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
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
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
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
              value={profile.email}
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
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              placeholder="Ej: +1 506 555 1234"
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
      )}
    </div>
  );
}
