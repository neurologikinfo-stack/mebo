"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

export default function BusinessDetailPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, email, phone, description, created_at")
        .eq("id", id)
        .single();
      if (!error) setBusiness(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p className="text-gray-500">Cargando...</p>;
  if (!business) return <p className="text-red-500">Negocio no encontrado.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{business.name}</h1>
      <p className="text-sm text-gray-600 mb-2">Slug: @{business.slug}</p>
      <p className="text-sm text-gray-600 mb-2">
        Email: {business.email || "—"}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        Teléfono: {business.phone || "—"}
      </p>
      <p className="text-sm text-gray-600 mb-6">
        {business.description || "Sin descripción"}
      </p>

      <div className="flex gap-4">
        <Link
          href={`/dashboard/admin/business/${business.id}/edit`}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm shadow hover:bg-blue-500"
        >
          Editar
        </Link>
        <Link
          href={`/business/${business.slug}`}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 text-sm shadow hover:bg-gray-300"
        >
          Ver público
        </Link>
      </div>
    </div>
  );
}
