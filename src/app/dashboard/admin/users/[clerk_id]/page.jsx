"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import useAdminUser from "@/hooks/useAdminUser";

export default function UserDetailPage() {
  const params = useParams();
  const clerk_id = params?.clerk_id
    ? decodeURIComponent(params.clerk_id)
    : null;

  const { user, loading, error } = useAdminUser(clerk_id);

  if (!clerk_id) return <p className="p-6">⚠️ Sin parámetro de usuario</p>;
  if (loading) return <p className="p-6">⏳ Cargando usuario...</p>;
  if (error) return <p className="p-6 text-red-500">❌ {error}</p>;
  if (!user) return <p className="p-6">Usuario no encontrado</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalle de usuario</h1>
        <Link
          href={`/dashboard/admin/users/${clerk_id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Editar
        </Link>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-3">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.full_name || "Avatar"}
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div>
            <p className="text-lg font-semibold">{user.full_name || "—"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <p>
          <span className="font-medium">Rol:</span>{" "}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium
        ${
          user.role === "admin"
            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
            : user.role === "owner"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
            : user.role === "staff"
            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
            : "bg-muted text-muted-foreground"
        }`}
          >
            {user.role}
          </span>
        </p>
        <p>
          <span className="font-medium">Clerk ID:</span> {user.clerk_id}
        </p>
        <p>
          <span className="font-medium">Creado:</span>{" "}
          {new Date(user.created_at).toLocaleString()}
        </p>
        <p>
          <span className="font-medium">Última actualización:</span>{" "}
          {new Date(user.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
