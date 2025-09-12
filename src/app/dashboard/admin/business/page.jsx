"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

// shadcn/ui
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function BusinessListPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/admin/businesses");
      const result = await res.json();
      if (!result.ok)
        throw new Error(result.error || "Error cargando negocios");
      setBusinesses(result.data ?? []);
    } catch (e) {
      setErr(e.message);
    }

    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("¿Seguro que quieres eliminar este negocio?")) return;
    setProcessingId(id);

    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!result.ok) throw new Error(result.error);
      fetchBusinesses();
    } catch (e) {
      alert("Error eliminando negocio: " + e.message);
    }

    setProcessingId(null);
  }

  async function handleRestore(id) {
    setProcessingId(id);

    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (!result.ok) throw new Error(result.error);
      fetchBusinesses();
    } catch (e) {
      alert("Error restaurando negocio: " + e.message);
    }

    setProcessingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Negocios
        </h1>
        <Button
          onClick={() => router.push("/dashboard/admin/business/new")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Crear negocio
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">Cargando...</p>}
      {err && <p className="text-destructive">{err}</p>}

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border shadow-sm bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((b) => (
              <TableRow
                key={b.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  console.log("➡️ Business ID:", b.id); // 👈 solo consola
                  router.push(`/dashboard/admin/business/${b.id}`);
                }}
              >
                {/* Logo */}
                <TableCell>
                  {b.logo_url ? (
                    <img
                      src={b.logo_url}
                      alt={b.name}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                      {b.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </TableCell>

                {/* Info */}
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>@{b.slug}</TableCell>
                <TableCell>{b.email || "—"}</TableCell>
                <TableCell>{b.phone || "—"}</TableCell>
                <TableCell>
                  {b.deleted_at ? (
                    <span className="text-destructive font-medium">
                      Eliminado
                    </span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Activo
                    </span>
                  )}
                </TableCell>

                {/* Acciones */}
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()} // 👈 evita que menú dispare navegación
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/admin/business/${b.id}`)
                        }
                      >
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/admin/business/${b.id}/edit`)
                        }
                      >
                        Editar
                      </DropdownMenuItem>
                      {b.deleted_at ? (
                        <DropdownMenuItem
                          onClick={() => handleRestore(b.id)}
                          disabled={processingId === b.id}
                          className="text-green-600 dark:text-green-400"
                        >
                          {processingId === b.id ? "Restaurando…" : "Restaurar"}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleDelete(b.id)}
                          disabled={processingId === b.id}
                          className="text-destructive"
                        >
                          {processingId === b.id ? "Eliminando…" : "Eliminar"}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
