"use client";
import { useEffect, useState } from "react";

export default function useUserByClerkId(clerkId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clerkId) return;

    async function fetchUser() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/users?clerk_id=${clerkId}`);
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Error desconocido");
        }

        setUser(result.user || null);
      } catch (err) {
        console.error("❌ Error en useUserByClerkId:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [clerkId]);

  return { user, loading, error };
}
