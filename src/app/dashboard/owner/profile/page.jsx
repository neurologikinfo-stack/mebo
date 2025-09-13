"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";

export default function OwnerProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ cargar perfil desde la tabla profiles
  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone, avatar_url")
        .eq("clerk_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Error al cargar perfil:", error.message);
        setProfile({
          full_name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
          phone: "",
          avatar_url: "",
        });
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.primaryEmailAddress?.emailAddress || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
        });
      } else {
        // si no hay fila en profiles, inicializamos con datos de Clerk
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

  // ✅ función genérica para guardar perfil
  async function saveProfile(updates) {
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert(
      {
        clerk_id: user.id,
        ...updates,
      },
      { onConflict: ["clerk_id"] }
    );

    if (error) throw new Error(error.message);

    setProfile((prev) => ({ ...prev, ...updates }));
  }

  // ✅ guardar cambios del formulario
  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await saveProfile(profile);
      setMessage("✅ Perfil actualizado correctamente");
    } catch (err) {
      console.error("❌ Error guardando:", err.message);
      setMessage("❌ Error al guardar: " + err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  }

  // ✅ subir avatar
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage("❌ Error al subir avatar: " + uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    try {
      await saveProfile({ avatar_url: publicUrl });
      setMessage("✅ Avatar actualizado");
    } catch (err) {
      setMessage("❌ Error al guardar avatar en BD");
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">⏳ Cargando perfil...</p>;
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
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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
