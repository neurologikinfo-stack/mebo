"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PermissionsPage() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar usuarios con permisos
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/users-with-permissions");
      const result = await res.json();
      if (res.ok && result.ok) {
        setUsers(result.data);
      } else {
        toast.error(result.error || "Error cargando usuarios");
      }
    })();
  }, []);

  // 🔹 Cargar catálogo de permisos
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/permissions");
      const result = await res.json();
      if (res.ok && result.ok) {
        setPermissions(result.data);
      } else {
        toast.error(result.error || "Error cargando permisos");
      }
    })();
  }, []);

  // 🔹 Agrupar permisos por recurso
  const groupedByResource = permissions.reduce((acc, perm) => {
    const [resource, action] = perm.name.split(".");
    if (!acc[resource]) acc[resource] = {};
    acc[resource][action] = perm;
    return acc;
  }, {});

  // 🔹 Toggle local (marcar/desmarcar sin guardar aún)
  function toggleLocalPermission(permission, checked) {
    setSelectedUser((prev) =>
      prev
        ? {
            ...prev,
            permissions: checked
              ? [...prev.permissions, permission]
              : prev.permissions.filter((p) => p !== permission),
          }
        : prev
    );
  }

  // 🔹 Guardar en bloque
  async function savePermissions() {
    if (!selectedUser) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.clerk_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: selectedUser.permissions,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Error al guardar permisos");
      }

      toast.success("✅ Permisos actualizados correctamente");

      // Actualizamos lista global
      setUsers((prev) =>
        prev.map((u) =>
          u.clerk_id === selectedUser.clerk_id
            ? { ...u, permissions: [...selectedUser.permissions] }
            : u
        )
      );
    } catch (err) {
      toast.error("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de permisos</h1>

      {/* Selector de usuario */}
      <div>
        <label className="block text-sm font-medium">Seleccionar usuario</label>
        <select
          value={selectedUser?.clerk_id || ""}
          onChange={(e) => {
            const user = users.find((u) => u.clerk_id === e.target.value);
            setSelectedUser(user || null);
          }}
          className="mt-1 block w-full px-3 py-2 border rounded text-black"
        >
          <option value="">-- Selecciona un usuario --</option>
          {users.map((u) => (
            <option key={u.clerk_id} value={u.clerk_id}>
              {u.full_name || u.email} ({u.role})
            </option>
          ))}
        </select>
      </div>

      {/* Tabla estilo Buildium con CRUD */}
      {selectedUser && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Recurso</th>
                <th className="px-4 py-2 text-center">Create</th>
                <th className="px-4 py-2 text-center">View</th>
                <th className="px-4 py-2 text-center">Edit</th>
                <th className="px-4 py-2 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByResource).map(([resource, actions]) => (
                <tr key={resource} className="border-t">
                  <td className="px-4 py-2 font-medium capitalize">
                    {resource}
                  </td>
                  {["create", "view", "edit", "delete"].map((action) => (
                    <td key={action} className="px-4 py-2 text-center">
                      {actions[action] ? (
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer"
                          checked={selectedUser.permissions.includes(
                            actions[action].name
                          )}
                          onChange={(e) =>
                            toggleLocalPermission(
                              actions[action].name,
                              e.target.checked
                            )
                          }
                          disabled={saving}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón guardar */}
      {selectedUser && (
        <div className="mt-4">
          <button
            onClick={savePermissions}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}
