"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRolePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

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

  function togglePermission(permName, checked) {
    setSelected((prev) =>
      checked ? [...prev, permName] : prev.filter((p) => p !== permName)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      alert("⚠️ Ingresa un nombre para el rol");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/roles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, permissions: selected }),
      });

      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Error al crear rol");
      }

      alert("✅ Rol creado correctamente");
      router.push("/dashboard/admin/roles");
    } catch (err) {
      console.error("❌ Error creando rol:", err.message);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Crear nuevo rol</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Nombre del rol</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: manager"
            className="mt-1 block w-full px-3 py-2 border rounded text-black"
          />
        </div>

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
                          checked={selected.includes(actions[action].name)}
                          onChange={(e) =>
                            togglePermission(
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

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          {saving ? "Creando..." : "Crear rol"}
        </button>
      </form>
    </div>
  );
}
