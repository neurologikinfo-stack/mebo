"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function OwnerDetailPage() {
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/owners/${id}`);
        const rawText = await res.text();
        console.log("📡 Respuesta cruda:", rawText);

        if (!rawText) throw new Error(`Respuesta vacía (${res.status})`);

        let result;
        try {
          result = JSON.parse(rawText);
        } catch {
          throw new Error(`Respuesta no es JSON válido (${res.status})`);
        }

        if (!res.ok || !result.ok)
          throw new Error(result.error || "Error desconocido");
        setOwner(result.data);
      } catch (err) {
        console.error("❌ Error cargando owner:", err);
        toast.error(err.message || "Error cargando owner");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-6">⏳ Cargando owner...</p>;
  if (!owner) return <p className="p-6">Owner no encontrado</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalle del Owner</h1>
        <Link
          href={`/dashboard/admin/owners/${id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Editar
        </Link>
      </div>

      {/* Limpio, sin fondo blanco fijo */}
      <div className="rounded-lg border text-card-foreground shadow-sm p-6 space-y-3">
        <p>
          <strong>Nombre:</strong> {owner.full_name || "—"}
        </p>
        <p>
          <strong>Email:</strong> {owner.email || "—"}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-xs font-medium
              ${
                owner.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : owner.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-700"
              }`}
          >
            {owner.status || "sin estado"}
          </span>
        </p>
        <p>
          <strong>Creado:</strong>{" "}
          {owner.created_at ? new Date(owner.created_at).toLocaleString() : "—"}
        </p>
      </div>
    </div>
  );
}
