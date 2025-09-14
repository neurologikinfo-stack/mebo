"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // shadcn/ui

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [preview, setPreview] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);

  // 🔹 Cargar roles
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/roles");
        const result = await res.json();
        if (res.ok && result.ok) {
          setRoles(result.data);
        } else {
          toast.error(result.error || "Error cargando roles");
        }
      } catch (err) {
        toast.error("❌ Error en fetch roles: " + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(roleId, roleName) {
    if (roleName.toLowerCase() === "admin") {
      toast.warning("⚠️ El rol 'admin' no puede eliminarse.");
      return;
    }

    if (!confirm(`¿Seguro que quieres eliminar el rol "${roleName}"?`)) return;

    setDeleting(roleId);
    try {
      const res = await fetch(`/api/admin/roles/${roleId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Error eliminando rol");
      }

      toast.success("✅ Rol eliminado correctamente");
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch (err) {
      toast.error("❌ " + err.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handlePreviewSeed() {
    try {
      setSeeding(true);
      const res = await fetch("/api/admin/roles/seed/preview");
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error);

      setPreview(result.data);
      setOpenPreview(true);
    } catch (err) {
      toast.error("❌ " + err.message);
    } finally {
      setSeeding(false);
    }
  }

  async function handleRunSeed() {
    try {
      setSeeding(true);
      const res = await fetch("/api/admin/roles/seed", { method: "POST" });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error);

      toast.success("✅ Roles y permisos insertados");

      // recargar lista
      const reload = await fetch("/api/admin/roles");
      const data = await reload.json();
      if (reload.ok && data.ok) setRoles(data.data);
    } catch (err) {
      toast.error("❌ " + err.message);
    } finally {
      setSeeding(false);
    }
  }

  // 🔹 Agrupar permisos por recurso/acción
  function groupByResource(perms) {
    return perms.reduce((acc, perm) => {
      const [resource, action] = perm.split(".");
      if (!acc[resource]) acc[resource] = {};
      acc[resource][action] = true;
      return acc;
    }, {});
  }

  if (loading) return <p className="p-6">⏳ Cargando roles...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header con botón crear y seed */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Roles</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePreviewSeed}
            disabled={seeding}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm"
          >
            {seeding ? "..." : "Preview seed"}
          </button>
          <button
            onClick={handleRunSeed}
            disabled={seeding}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm"
          >
            {seeding ? "..." : "Run seed"}
          </button>
          <Link
            href="/dashboard/admin/roles/new"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
          >
            + Crear rol
          </Link>
        </div>
      </div>

      {/* Tabla de roles */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Rol</th>
              <th className="px-4 py-2 text-left">Permisos</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-2 font-medium">{role.name}</td>
                <td className="px-4 py-2">
                  {role.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Sin permisos
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/dashboard/admin/roles/${role.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs w-20 text-center"
                    >
                      Editar
                    </Link>
                    {role.name.toLowerCase() !== "admin" && (
                      <button
                        onClick={() => handleDelete(role.id, role.name)}
                        disabled={deleting === role.id}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs w-20 text-center"
                      >
                        {deleting === role.id ? "..." : "Eliminar"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal preview con tabla de permisos */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista previa de seed</DialogTitle>
          </DialogHeader>

          {preview ? (
            <div className="space-y-6">
              {preview.map((role) => {
                const grouped = groupByResource(role.permissions);
                return (
                  <div key={role.name} className="border rounded-lg p-3">
                    <h3 className="font-semibold mb-2">{role.name}</h3>
                    <table className="min-w-full text-sm border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left">Recurso</th>
                          <th className="px-3 py-2 text-center">View</th>
                          <th className="px-3 py-2 text-center">Edit</th>
                          <th className="px-3 py-2 text-center">Delete</th>
                          <th className="px-3 py-2 text-center">Create</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(grouped).map(([resource, actions]) => (
                          <tr key={resource} className="border-t">
                            <td className="px-3 py-2 font-medium">
                              {resource}
                            </td>
                            {["view", "edit", "delete", "create"].map(
                              (action) => (
                                <td
                                  key={action}
                                  className="px-3 py-2 text-center"
                                >
                                  {actions[action] ? "✔️" : "—"}
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>⏳ Cargando preview...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
