"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function OwnerDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    businesses: 0,
    appointments: 0,
    payments: 0,
  });
  const [businesses, setBusinesses] = useState([]);
  const [appointmentsChart, setAppointmentsChart] = useState([]);
  const [paymentsChart, setPaymentsChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);

      // 🔹 Negocios del owner (Clerk ID)
      const { data: biz, error: bizError } = await supabase
        .from("businesses")
        .select("id, name, logo_url, created_at")
        .eq("owner_clerk_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (bizError) {
        console.error("Error cargando negocios:", bizError.message);
        setBusinesses([]);
        setStats({ businesses: 0, appointments: 0, payments: 0 });
        setLoading(false);
        return;
      }

      if (!biz?.length) {
        setStats({ businesses: 0, appointments: 0, payments: 0 });
        setBusinesses([]);
        setLoading(false);
        return;
      }

      setBusinesses(biz);

      const businessIds = biz.map((b) => b.id);

      // 🔹 Citas
      const { data: appts } = await supabase
        .from("appointments")
        .select("id, starts_at, status")
        .in("business_id", businessIds);

      // 🔹 Pagos
      const { data: pays } = await supabase
        .from("payments")
        .select("id, amount, created_at")
        .in("business_id", businessIds);

      // 🔹 KPIs
      setStats({
        businesses: biz.length,
        appointments: appts?.length || 0,
        payments: pays?.length || 0,
      });

      // 📊 Citas por día
      const byDay = {};
      appts?.forEach((a) => {
        const day = new Date(a.starts_at).toLocaleDateString("es-ES", {
          weekday: "short",
        });
        byDay[day] = (byDay[day] || 0) + 1;
      });
      setAppointmentsChart(
        Object.entries(byDay).map(([day, count]) => ({
          name: day,
          citas: count,
        }))
      );

      // 📊 Pagos por mes
      const byMonth = {};
      pays?.forEach((p) => {
        const month = new Date(p.created_at).toLocaleDateString("es-ES", {
          month: "short",
        });
        byMonth[month] = (byMonth[month] || 0) + p.amount;
      });
      setPaymentsChart(
        Object.entries(byMonth).map(([month, total]) => ({
          name: month,
          monto: total,
        }))
      );

      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Bienvenido {user?.firstName || "Propietario"}
        </h1>
        <Link
          href="/dashboard/owner/businesses/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500"
        >
          + Crear negocio
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-sm font-medium text-gray-500">Mis Negocios</h2>
          <p className="text-2xl font-semibold text-blue-600">
            {loading ? "…" : stats.businesses}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-sm font-medium text-gray-500">Citas totales</h2>
          <p className="text-2xl font-semibold text-green-600">
            {loading ? "…" : stats.appointments}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-sm font-medium text-gray-500">Pagos recibidos</h2>
          <p className="text-2xl font-semibold text-yellow-600">
            {loading ? "…" : stats.payments}
          </p>
        </div>
      </div>

      {/* Últimos negocios */}
      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Últimos negocios</h2>
        {businesses.length === 0 ? (
          <p className="text-gray-500">Aún no tienes negocios registrados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {businesses.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className="flex flex-col items-center text-center"
              >
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.name}
                    className="h-16 w-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
                    {b.name.charAt(0)}
                  </div>
                )}
                <p className="mt-2 text-sm font-medium">{b.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📊 Gráfica de citas */}
      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Citas por día</h2>
        {appointmentsChart.length === 0 ? (
          <p className="text-gray-500">No hay datos de citas aún.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsChart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="citas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 📊 Gráfica de pagos */}
      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Pagos por mes</h2>
        {paymentsChart.length === 0 ? (
          <p className="text-gray-500">No hay datos de pagos aún.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentsChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="monto"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Accesos rápidos</h2>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/dashboard/owner/businesses"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow hover:bg-blue-500"
          >
            Ver mis negocios
          </Link>
          <Link
            href="/dashboard/owner/appointments"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
          >
            Ver citas
          </Link>
          <Link
            href="/dashboard/owner/payments"
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
          >
            Ver pagos
          </Link>
        </div>
      </div>
    </div>
  );
}
