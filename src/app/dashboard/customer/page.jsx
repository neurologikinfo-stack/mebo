"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

export default function CustomerDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .or(
          `email.eq.${user.primaryEmailAddress?.emailAddress},clerk_id.eq.${user.id}`
        )
        .maybeSingle();

      if (!customer) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .select("status")
        .eq("customer_id", customer.id);

      if (!error && data) {
        const confirmed = data.filter((a) => a.status === "confirmed").length;
        const pending = data.filter((a) => a.status === "pending").length;
        const cancelled = data.filter((a) => a.status === "cancelled").length;

        setStats({ confirmed, pending, cancelled });
      }

      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Bienvenido {user?.firstName || "Cliente"}
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-sm font-medium text-gray-500">
            Citas confirmadas
          </h2>
          <p className="text-2xl font-semibold text-green-600">
            {loading ? "…" : stats.confirmed}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-sm font-medium text-gray-500">
            Citas pendientes
          </h2>
          <p className="text-2xl font-semibold text-yellow-600">
            {loading ? "…" : stats.pending}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-sm font-medium text-gray-500">
            Citas canceladas
          </h2>
          <p className="text-2xl font-semibold text-gray-500">
            {loading ? "…" : stats.cancelled}
          </p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Accesos rápidos</h2>
        <div className="flex gap-4">
          <Link
            href="/dashboard/customer/appointments"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow hover:bg-blue-500"
          >
            Ver mis citas
          </Link>
          <Link
            href="/dashboard/customer/profile"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
          >
            Mi perfil
          </Link>
          <Link
            href="/dashboard/customer/settings"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
          >
            Configuración
          </Link>
        </div>
      </div>
    </div>
  );
}
