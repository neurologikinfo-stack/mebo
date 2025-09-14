"use client";

import { useEffect, useState } from "react";

export default function PermissionsPage() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar usuarios con permisos
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/users-with-permissions");
      const result = await res.json();
      if (res.ok && result.ok) {
        setUsers(result.data);
      } else {
        console.error("❌ Error cargando usuarios:", result.error);
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
        console.error("❌ Error cargando permisos:", result.error);
      }
    })();
  }, []);

  async function togglePermission(permission, checked) {
    if (!selectedUser) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/user-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: selectedUser.clerk_id,
          permission,
          grant: checked,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Error actualizando permiso");
      }

      // 🔹 actualizar localmente
      setUsers((prev) =>
        prev.map((u) =>
          u.clerk_id === selectedUser.clerk_id
            ? {
                ...u,
                permissions: checked
                  ? [...u.permissions, permission]
                  : u.permissions.filter((p) => p !== permission),
              }
            : u
        )
      );
    } catch (err) {
      console.error("❌ Error al asignar permiso:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de permisos</h1>

      {/* 🔹 Selector de usuario */}
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

      {/* 🔹 Tabla de permisos */}
      {selectedUser && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Permiso</th>
                <th className="px-4 py-2 text-center">Asignado</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm.id}>
                  <td className="px-4 py-2">{perm.name}</td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.permissions.includes(perm.name)}
                      onChange={(e) =>
                        togglePermission(perm.name, e.target.checked)
                      }
                      disabled={loading}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
