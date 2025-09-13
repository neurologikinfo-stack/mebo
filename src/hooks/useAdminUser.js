"use client";
import { useEffect, useState, useCallback } from "react";

export default function useAdminUser({ id, clerkId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Cargar usuario por ID o ClerkId
  const fetchUser = useCallback(async () => {
    if (!id && !clerkId) return;

    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      if (id) query.append("id", id);
      if (clerkId) query.append("clerk_id", clerkId);

      const res = await fetch(`/api/admin/users?${query.toString()}`, {
        cache: "no-store",
      });

      const result = await res.json();
      if (!res.ok || !result.ok)
        throw new Error(result.error || "Error desconocido");

      setUser(result.data || null);
    } catch (err) {
      console.error("❌ Error en useAdminUser:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, clerkId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 🔹 Guardar cambios
  async function saveUser(updates) {
    if (!id && !clerkId) return { ok: false, error: "Falta ID o clerkId" };

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${id || clerkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const result = await res.json();
      if (!res.ok || !result.ok)
        throw new Error(result.error || "Error al guardar");

      setUser((prev) => ({ ...prev, ...updates }));
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
