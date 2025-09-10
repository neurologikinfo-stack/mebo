"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

export default function OwnerBusinessesPage() {
  const { user } = useUser();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchBusinesses();
  }, [user]);

  async function fetchBusinesses() {
    setLoading(true);
    setErr("");

    if (!user?.id) {
      setErr("No se encontró el usuario de Clerk.");
      setLoading(false);
      return;
    }

    // Solo negocios activos (deleted_at IS NULL)
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, slug, phone, email, created_at, logo_url, deleted_at")
      .eq("owner_clerk_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setBusinesses([]);
    } else {
      setBusinesses(data ?? []);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("¿Seguro que quieres eliminar este negocio?")) return;

    setDeletingId(id);

    try {
      // 👇 Llamamos a la API segura que hace el soft delete con supabaseServer()
      const res = await fetch(`/api/businesses/${id}/delete`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!result.ok) throw new Error(result.error);

      // Actualizamos listado local
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      alert("Error eliminando negocio: " + e.message);
    }

    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mis Negocios</h1>
        <Link
          href="/dashboard/owner/businesses/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500"
        >
          + Crear negocio
        </Link>
      </div>

      {loading && <p>Cargando...</p>}
      {err && <p className="text-red-600">{err}</p>}

      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Listado de negocios</h2>

        {businesses.length === 0 && !loading ? (
          <p className="text-gray-500">No tienes negocios registrados.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Logo</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Fecha de creación</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {businesses.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.name}
                        className="h-10 w-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {b.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {b.name}
                  </td>
                  <td className="px-4 py-3">{b.phone || "—"}</td>
                  <td className="px-4 py-3">{b.email || "—"}</td>
                  <td className="px-4 py-3">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link
                      href={`/dashboard/owner/businesses/${b.id}`}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={deletingId === b.id}
                      className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500 disabled:opacity-50"
                    >
                      {deletingId === b.id ? "Eliminando…" : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
