"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

// shadcn/ui
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 9;

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
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
    <main className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Negocios</h1>
          <p className="text-sm text-muted-foreground">
            Listado desde tu base de datos en Supabase.
          </p>
        </div>
        {isLoaded && isSignedIn && isAdmin && (
          <Button
            onClick={handleSync}
            className="bg-blue-600 hover:bg-blue-500"
          >
            Sincronizar Usuarios
          </Button>
        )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b) => (
                <Card
                  key={b.id}
                  className="cursor-pointer hover:shadow-md transition"
                  onClick={() => router.push(`/business/${b.slug}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="line-clamp-1">
                        {b.name || "Sin nombre"}
                      </CardTitle>
                      <Badge variant="outline">
                        {formatDate(b.created_at)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">@{b.slug}</p>
                  </CardHeader>

                  <CardContent>
                    {b.description && (
                      <p className="line-clamp-2 text-sm text-gray-600 mb-2">
                        {b.description}
                      </p>
                    )}
                    <div className="space-y-1 text-sm text-gray-600">
                      {b.phone && <p>📞 {b.phone}</p>}
                      {b.email && <p>✉️ {b.email}</p>}
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Acciones
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {isAdmin || b.created_by === userId ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/dashboard/admin/businesses/${b.id}/edit`
                              );
                            }}
                          >
                            Editar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/${b.slug}/book`);
                            }}
                          >
                            Reservar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Paginador */}
            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {showingRange}
              </span>
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
    return new Intl.DateTimeFormat("es", {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-28 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ hasQuery, clear }) {
  return (
    <Card className="text-center py-10">
      <CardContent>
        <div className="text-4xl mb-2">🗂️</div>
        <h3 className="text-lg font-semibold">
          {hasQuery ? "Sin resultados" : "Aún no hay negocios"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasQuery
            ? "Prueba con otro término o limpia el filtro."
            : "Crea tu primer negocio para empezar."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {hasQuery ? (
            <Button variant="outline" onClick={clear}>
              Limpiar búsqueda
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/dashboard/admin/businesses/new")}
            >
              Crear negocio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Pager({ page, maxPage, canPrev, canNext, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onPrev} disabled={!canPrev} variant="outline" size="sm">
        ← Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page} / {maxPage}
      </span>
      <Button onClick={onNext} disabled={!canNext} variant="outline" size="sm">
        Siguiente →
      </Button>
    </div>
  );
}
