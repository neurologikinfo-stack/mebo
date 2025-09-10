"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";

export default function OwnerPaymentsPage() {
  const { user } = useUser();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);
      setErr("");

      // Buscar owner
      const { data: owner } = await supabase
        .from("owners")
        .select("id")
        .or(
          `email.eq.${user.primaryEmailAddress?.emailAddress},clerk_id.eq.${user.id}`
        )
        .maybeSingle();

      if (!owner) {
        setErr("No se encontró el propietario.");
        setLoading(false);
        return;
      }

      // Buscar negocios del owner
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", owner.id);

      if (!businesses?.length) {
        setErr("No tienes negocios registrados.");
        setLoading(false);
        return;
      }

      const businessIds = businesses.map((b) => b.id);

      // Buscar pagos asociados a esos negocios
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount, status, created_at, business_id, businesses(name)")
        .in("business_id", businessIds)
        .order("created_at", { ascending: false });

      if (error) {
        setErr(error.message);
        setPayments([]);
      } else {
        setPayments(data ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Pagos</h1>

      {loading && <p>Cargando...</p>}
      {err && <p className="text-red-600">{err}</p>}

      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Historial de pagos</h2>

        {payments.length === 0 && !loading ? (
          <p className="text-gray-500">No tienes pagos registrados.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Negocio</th>
                <th className="px-4 py-3 text-left">Monto</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.businesses?.name || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    ${p.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : p.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
