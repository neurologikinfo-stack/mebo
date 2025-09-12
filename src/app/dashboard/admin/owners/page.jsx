"use client";

import useOwners from "@/hooks/useOwners";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AddOwnerModal from "@/components/AddOwnerModal";

export default function OwnersPage() {
  const { owners, loading, error, refetch } = useOwners();
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl font-bold">Owners</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Nuevo Owner
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p>⏳ Cargando owners...</p>
      ) : error ? (
        <p className="text-red-600">❌ Error: {error}</p>
      ) : owners.length === 0 ? (
        <p className="text-gray-500">No se encontraron owners.</p>
      ) : (
        <ul className="divide-y divide-border rounded border">
          {owners.map((owner) => (
            <li
              key={owner.id}
              className="p-3 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition"
              onClick={() => {
                console.log("➡️ Owner ID:", owner.id); // 👈 solo consola
                router.push(`/dashboard/admin/owners/${owner.id}`);
              }}
            >
              <div>
                <p className="font-medium">{owner.full_name}</p>
                <p className="text-sm text-muted-foreground">{owner.email}</p>
              </div>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  owner.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {owner.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      <AddOwnerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={refetch}
      />
    </div>
  );
}
