"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

const PAGE_SIZE = 9;

export default function Home() {
  const { user } = useUser();
  const userId = user?.id;
  const isAdmin = user?.publicMetadata?.role === "admin";
  const router = useRouter();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("created_desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    setPage(1);
  }, [q, sort]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      let query = supabase
        .from("businesses")
        .select("id,name,slug,phone,email,created_at,description,created_by", {
          count: "exact",
        });

      const term = q.trim();
      if (term) {
        query = query.or(
          `name.ilike.%${term}%,slug.ilike.%${term}%,description.ilike.%${term}%`
        );
      }

      if (sort === "name_asc") query = query.order("name", { ascending: true });
      else if (sort === "created_asc")
        query = query.order("created_at", { ascending: true });
      else query = query.order("created_at", { ascending: false });

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        setErr(error.message || "No se pudieron cargar los negocios.");
        setBusinesses([]);
        setTotal(0);
      } else {
        setBusinesses(Array.isArray(data) ? data : []);
        setTotal(typeof count === "number" ? count : 0);
      }
      setLoading(false);
    })();
  }, [page, q, sort]);

  const canPrev = page > 1;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canNext = page < maxPage;

  const showingRange = useMemo(() => {
    if (total === 0) return "Mostrando 0 de 0";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return `Mostrando ${start}–${end} de ${total}`;
  }, [page, total]);

  async function handleSync() {
    setSyncMsg("Sincronizando...");
    try {
      const res = await fetch("/api/backfill-clerk-profiles");
      const data = await res.json();
      setSyncMsg(data.message || data.error);
    } catch (err) {
      setSyncMsg("❌ Error en la sincronización");
    }
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Negocios
          </h1>
          <p className="text-sm text-gray-500">
            Listado desde tu base de datos en Supabase.
          </p>
        </div>
        <button
          onClick={handleSync}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500"
        >
          Sincronizar Usuarios
        </button>
      </div>

      {syncMsg && (
        <p className="mb-4 text-sm text-green-600 font-medium">{syncMsg}</p>
      )}

      {/* Grid */}
      <section>
        {loading ? (
          <SkeletonGrid />
        ) : total === 0 ? (
          <EmptyState hasQuery={!!q} clear={() => setQ("")} />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((b) => (
                <li
                  key={b.id}
                  onClick={() => router.push(`/business/${b.slug}`)}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:bg-gray-50"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h2 className="line-clamp-1 text-lg font-semibold text-gray-800">
                      {b.name || "Sin nombre"}
                    </h2>
                    <span className="rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                      {formatDate(b.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">@{b.slug}</p>

                  {b.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {b.description}
                    </p>
                  )}

                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    {b.phone && <p>📞 {b.phone}</p>}
                    {b.email && <p>✉️ {b.email}</p>}
                  </div>

                  <div className="mt-5 flex gap-2">
                    {isAdmin || b.created_by === userId ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/businesses/${b.id}/edit`);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        Editar
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${b.slug}/book`);
                        }}
                        className="rounded-lg border border-blue-500 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100"
                      >
                        Book
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Paginador */}
            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm text-gray-500">{showingRange}</span>
              <Pager
                page={page}
                maxPage={maxPage}
                canPrev={canPrev}
                canNext={canNext}
                onPrev={() => canPrev && setPage((p) => p - 1)}
                onNext={() => canNext && setPage((p) => p + 1)}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/* Helpers */
function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(d));
  } catch {
    return "—";
  }
}

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="rounded-xl border border-gray-200 p-4 animate-pulse bg-white shadow-sm"
        >
          <div className="h-5 w-2/3 rounded bg-gray-200" />
          <div className="mt-1 h-3 w-28 rounded bg-gray-200" />
          <div className="mt-3 h-12 w-full rounded bg-gray-200" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-20 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded bg-gray-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ hasQuery, clear }) {
  return (
    <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
      <div className="text-3xl">🗂️</div>
      <h3 className="mt-2 text-lg font-semibold text-gray-800">
        {hasQuery ? "Sin resultados" : "Aún no hay negocios"}
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {hasQuery
          ? "Prueba con otro término o limpia el filtro."
          : "Crea tu primer negocio para empezar."}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {hasQuery ? (
          <button
            onClick={clear}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Limpiar búsqueda
          </button>
        ) : (
          <button
            onClick={() => router.push("/admin/businesses/new")}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800"
          >
            Crear negocio
          </button>
        )}
      </div>
    </div>
  );
}

function Pager({ page, maxPage, canPrev, canNext, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
      >
        ← Anterior
      </button>
      <span className="text-sm text-gray-600">
        Página {page} / {maxPage}
      </span>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
      >
        Siguiente →
      </button>
    </div>
  );
}
