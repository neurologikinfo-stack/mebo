"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";

export default function OwnerAppointmentsPage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [message, setMessage] = useState(null);

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

      // Buscar citas de todos esos negocios
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `id, starts_at, ends_at, status,
           services(name),
           staff(name),
           customers(full_name, email),
           businesses(name)`
        )
        .in("business_id", businessIds)
        .order("starts_at", { ascending: false });

      if (error) {
        setErr(error.message);
        setAppointments([]);
      } else {
        setAppointments(data ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  // Auto-cierre de mensajes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function handleStatusChange(a, newStatus) {
    const ok = confirm(
      `¿Seguro que quieres ${
        newStatus === "reschedule"
          ? "reprogramar"
          : `cambiar la cita a '${newStatus}'`
      }?`
    );
    if (!ok) return;

    if (newStatus === "reschedule") {
      window.location.href = `/reprogramar/${a.id}`;
      return;
    }

    const res = await fetch("/api/customer/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointment_id: a.id,
        status: newStatus,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === a.id ? { ...appt, status: newStatus } : appt
        )
      );
      setMessage({
        type: "success",
        text: `Estado actualizado a ${newStatus}`,
      });
    } else {
      setMessage({ type: "error", text: data.error });
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Citas de mis negocios
      </h1>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Listado de citas</h2>

        {loading && <p>Cargando...</p>}
        {err && <p className="text-red-600">{err}</p>}

        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Negocio</th>
              <th className="px-4 py-3 text-left">Servicio</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Staff</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">{a.businesses?.name}</td>
                <td className="px-4 py-3">{a.services?.name}</td>
                <td className="px-4 py-3">
                  {a.customers?.full_name || a.customers?.email}
                </td>
                <td className="px-4 py-3">{a.staff?.name}</td>
                <td className="px-4 py-3">
                  {new Date(a.starts_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      a.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : a.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={a.status}
                    onChange={(e) => handleStatusChange(a, e.target.value)}
                    className="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
                  >
                    {a.status === "cancelled" ? (
                      <>
                        <option value="cancelled">Cancelada</option>
                        <option value="reschedule">Reprogramar</option>
                      </>
                    ) : (
                      <>
                        <option value="confirmed">Confirmada</option>
                        <option value="pending">Pendiente</option>
                        <option value="cancelled">Cancelar</option>
                      </>
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && !loading && (
          <p className="text-gray-500 mt-4">
            No tienes citas registradas en tus negocios.
          </p>
        )}
      </div>
    </div>
  );
}
