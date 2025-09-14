"use client";
import { useEffect, useState } from "react";

export default function useUserByClerkId(clerk_id) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clerk_id) return;

    async function fetchUser() {
      setLoading(true);
      setError(null);

      try {
        // ✅ ahora pedimos al endpoint directo /[clerk_id]
        const res = await fetch(`/api/admin/users/${clerk_id}`, {
          cache: "no-store",
        });
        const result = await res.json();

        if (!res.ok || !result.ok) {
          throw new Error(result.error || "No se pudo cargar el usuario");
        }

        setUser(result.data || null);
      } catch (err) {
        console.error("❌ Error en useUserByClerkId:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [clerk_id]);

  return { user, loading, error };
}
