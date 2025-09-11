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
        .select(
          `
          id,
          name,
          slug,
          email,
          phone,
          description,
          logo_url,
          created_at,
          address,
          city,
          province,
          postal_code,
          country,
          latitude,
          longitude
        `
        )
        .eq("slug", slug)
        .maybeSingle();

      setBusiness(data);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="p-6">Cargando negocio...</div>;
  if (!business) return <div className="p-6">Negocio no encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Logo o inicial */}
      <div className="flex items-center gap-4">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            className="h-20 w-20 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
            {business.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="text-sm text-muted-foreground">@{business.slug}</p>
        </div>
      </div>

      {/* Datos */}
      <div className="space-y-2 text-sm">
        <p>
          <strong>Email:</strong> {business.email || "—"}
        </p>
        <p>
          <strong>Teléfono:</strong> {business.phone || "—"}
        </p>
        <p>
          <strong>Dirección:</strong> {business.address || "—"}
        </p>
        <p>
          <strong>Ciudad:</strong> {business.city || "—"}
        </p>
        <p>
          <strong>Provincia/Estado:</strong> {business.province || "—"}
        </p>
        <p>
          <strong>Código Postal:</strong> {business.postal_code || "—"}
        </p>
        <p>
          <strong>País:</strong> {business.country || "—"}
        </p>
        <p>
          <strong>Descripción:</strong>{" "}
          {business.description || "Este negocio aún no tiene descripción."}
        </p>
        <p className="text-xs text-muted-foreground">
          Creado el {new Date(business.created_at).toLocaleDateString("es-ES")}
        </p>
      </div>

      {/* Ubicación en mapa (opcional si tienes lat/lng) */}
      {business.latitude && business.longitude && (
        <div className="mt-4">
          <iframe
            title="mapa"
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${business.latitude},${business.longitude}&hl=es&z=14&output=embed`}
          ></iframe>
        </div>
      )}
    </div>
  );
}
