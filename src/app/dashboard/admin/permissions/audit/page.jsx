"use client";

import { useEffect, useState } from "react";

export default function PermissionsAuditPage() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  // 🔹 Cargar usuarios con permisos
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/users-with-permissions");
      const result = await res.json();
      if (res.ok && result.ok) {
        setUsers(result.data);
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
      }
      setLoading(false);
    })();
  }, []);

  async function togglePermission(user, permission, grant) {
    setSaving(user.clerk_id);
    try {
      const res = await fetch("/api/admin/user-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.clerk_id,
          permission,
          grant,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error);

      // actualizar estado local
      setUsers((prev) =>
        prev.map((u) =>
          u.clerk_id === user.clerk_id
            ? {
                ...u,
                permissions: grant
                  ? [...u.permissions, permission]
                  : u.permissions.filter((p) => p !== permission),
              }
            : u
        )
      );
    } catch (err) {
      console.error("❌ Error togglePermission:", err.message);
      alert(err.message);
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p className="p-6">⏳ Cargando permisos...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Auditoría de permisos</h1>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Usuario</th>
              {permissions.map((perm) => (
                <th key={perm.id} className="px-4 py-2 text-center">
                  {perm.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.clerk_id} className="border-t">
                <td className="px-4 py-2 font-medium">
                  {u.full_name || u.email}
                  <span className="text-xs text-muted-foreground block">
                    {u.role}
                  </span>
                </td>
                {permissions.map((perm) => (
                  <td key={perm.id} className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={u.permissions.includes(perm.name)}
                      onChange={(e) =>
                        togglePermission(u, perm.name, e.target.checked)
                      }
                      disabled={saving === u.clerk_id}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
