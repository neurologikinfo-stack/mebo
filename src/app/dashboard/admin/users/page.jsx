"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

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

    setUsers((prev) =>
      prev.map((u) => (u.clerk_id === clerk_id ? { ...u, role } : u))
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Usuarios
        </h1>
        <span className="text-sm text-muted-foreground">
          Total: {users.length} usuarios
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border shadow-sm bg-card text-card-foreground">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                Email
              </th>
              <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                Nombre
              </th>
              <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                Rol
              </th>
              <th className="px-6 py-3 text-left font-semibold text-muted-foreground">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr
                key={u.clerk_id}
                className="hover:bg-muted/50 transition cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/admin/users/${u.clerk_id}`)
                }
              >
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {u.full_name || "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        u.role === "admin"
                          ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                          : u.role === "owner"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                          : u.role === "staff"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {u.role}
                  </span>
                </td>

                {/* ✅ DropdownMenu en lugar de <select> */}
                <td
                  className="px-6 py-4"
                  onClick={(e) => e.stopPropagation()} // evita navegación desde esta celda
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Cambiar rol
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["owner", "customer", "staff", "user", "admin"].map(
                        (role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => updateRole(u.clerk_id, role)}
                          >
                            {role}
                          </DropdownMenuItem>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
