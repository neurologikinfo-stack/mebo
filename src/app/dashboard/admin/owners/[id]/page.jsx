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
        const result = await res.json();
        if (!res.ok || !result.ok) throw new Error(result.error);
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

      <div className="rounded-lg border text-card-foreground shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={owner.avatar_url || "/default-avatar.png"}
            alt={owner.full_name}
            className="w-16 h-16 rounded-full object-cover border"
          />
          <div>
            <p className="text-xl font-semibold">{owner.full_name || "—"}</p>
            <p className="text-sm text-muted-foreground">
              {owner.email || "—"}
            </p>
          </div>
        </div>

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
