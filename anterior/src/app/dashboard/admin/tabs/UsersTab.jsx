"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
export default function UsersTab() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role");
      if (!error) setUsers(data);
    })();
  }, []);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
      <table className="min-w-full divide-y divide-gray-200 border rounded-lg shadow-sm bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
              Email
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
              Nombre
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
              Rol
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-2 text-sm text-gray-800">{u.email}</td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {u.full_name || "—"}
              </td>
              <td className="px-4 py-2 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
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
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
