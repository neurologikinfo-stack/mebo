"use client";
import { useEffect, useState } from "react";

export default function useOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchOwners() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/owners", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      if (result.ok) {
        setOwners(result.data || []);
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (err) {
      console.error("❌ Error en fetchOwners:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOwners();
  }, []);

  return { owners, loading, error, refetch: fetchOwners };
}
