"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditRolePage() {
  const { role_id } = useParams();
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar rol
  useEffect(() => {
    if (!role_id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/roles/${role_id}`);
        const result = await res.json();
        if (res.ok && result.ok) {
          setRole(result.data);
        } else {
          console.error("❌ Error cargando rol:", result.error);
        }
      } catch (err) {
        console.error("❌ Error en fetch rol:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [role_id]);

  // 🔹 Cargar catálogo de permisos
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/permissions");
        const result = await res.json();
        if (res.ok && result.ok) {
          setPermissions(result.data);
        } else {
          console.error("❌ Error cargando permisos:", result.error);
        }
      } catch (err) {
        console.error("❌ Error en fetch permisos:", err);
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

  // Toggle local
  function toggleLocalPermission(permission, checked) {
    setRole((prev) =>
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

  // Guardar cambios
  async function savePermissions() {
    if (!role) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/roles/${role_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: role.permissions }),
      });

      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Error al guardar permisos");
      }

      alert("✅ Permisos de rol actualizados correctamente");
      router.push("/dashboard/admin/roles"); // redirigir a listado
    } catch (err) {
      console.error("❌ Error guardando permisos:", err.message);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6">⏳ Cargando rol...</p>;
  if (!role) return <p className="p-6">❌ Rol no encontrado</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Editar rol: {role.name}</h1>

      {/* Tabla estilo Buildium */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Recurso</th>
              <th className="px-4 py-2 text-center">View</th>
              <th className="px-4 py-2 text-center">Edit</th>
              <th className="px-4 py-2 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByResource).map(([resource, actions]) => (
              <tr key={resource} className="border-t">
                <td className="px-4 py-2 font-medium">{resource}</td>
                {["view", "edit", "delete"].map((action) => (
                  <td key={action} className="px-4 py-2 text-center">
                    {actions[action] ? (
                      <input
                        type="checkbox"
                        checked={role.permissions.includes(
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
                      "—"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón guardar */}
      <div className="mt-4">
        <button
          onClick={savePermissions}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
