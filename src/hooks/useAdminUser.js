"use client";
import { useEffect, useState, useCallback } from "react";

export default function useAdminUser(clerk_id) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Cargar usuario por clerk_id
  const fetchUser = useCallback(async () => {
    if (!clerk_id) return;

    setLoading(true);
    setError(null);

    try {
      console.log("👉 useAdminUser llamado con clerk_id:", clerk_id);

      const res = await fetch(`/api/admin/users/${clerk_id}`, {
        cache: "no-store",
      });
      const result = await res.json();

      console.log("👉 Respuesta de API:", result);

      if (!res.ok || !result.ok) {
        throw new Error(result.error || "No se pudo cargar el usuario");
      }

      setUser(result.data || null);
    } catch (err) {
      console.error("❌ Error en useAdminUser:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clerk_id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 🔹 Guardar cambios
  async function saveUser(updates) {
    if (!clerk_id) return { ok: false, error: "Falta clerk_id" };

    setSaving(true);
    setError(null);

    try {
      console.log(
        "👉 PATCH a /api/admin/users/",
        clerk_id,
        " con updates:",
        updates
      );

      const res = await fetch(`/api/admin/users/${clerk_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const result = await res.json();
      console.log("👉 Respuesta PATCH:", result);

      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Error al guardar");
      }

      setUser(result.data);
      return { ok: true, data: result.data };
    } catch (err) {
      console.error("❌ Error guardando user:", err.message);
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }

  return {
    user,
    loading,
    error,
    saving,
    refetch: fetchUser,
    saveUser,
  };
}
