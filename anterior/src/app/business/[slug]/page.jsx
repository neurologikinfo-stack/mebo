"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function BusinessDetailPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .single();

      setBusiness(data);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="p-6">Cargando negocio...</div>;
  if (!business) return <div className="p-6">Negocio no encontrado</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{business.name}</h1>
      <p>
        <strong>Slug:</strong> {business.slug}
      </p>
      <p>
        <strong>Email:</strong> {business.email || "—"}
      </p>
      <p>
        <strong>Teléfono:</strong> {business.phone || "—"}
      </p>
      <p>
        <strong>Descripción:</strong> {business.description || "—"}
      </p>
    </div>
  );
}
