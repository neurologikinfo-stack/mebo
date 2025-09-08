"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    })();
  }, []);

  async function updateRole(clerk_id, role) {
    const res = await fetch("/api/admin/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerk_id, role }),
    });
    const data = await res.json();
    alert(data.message || data.error);

    // refrescar UI después del cambio
    setUsers((prev) =>
      prev.map((u) => (u.clerk_id === clerk_id ? { ...u, role } : u))
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">
          Usuarios
        </h1>
        <span className="text-sm text-gray-500">
          Total: {users.length} usuarios
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {u.full_name || "—"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        u.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : u.role === "owner"
                          ? "bg-blue-100 text-blue-700"
                          : u.role === "staff"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.clerk_id, e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="owner">Owner</option>
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
