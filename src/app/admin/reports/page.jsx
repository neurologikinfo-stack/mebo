import { supabaseServer } from "@/utils/supabase/server";
import Chart from "./Chart"; // 👈 nuevo componente client

export default async function ReportsPage() {
  const supabase = supabaseServer();

  // Datos
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: businessCount } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true });

  const { data: userWeekly } = await supabase.rpc("get_weekly_user_stats");
  const { data: businessWeekly } = await supabase.rpc(
    "get_weekly_business_stats"
  );

  const chartData = (userWeekly || []).map((u, idx) => ({
    week: u.week_label,
    users: u.count,
    business: businessWeekly?.[idx]?.count || 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6"></h1>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-white border shadow">
          <h2 className="text-sm font-medium text-gray-600">Usuarios</h2>
          <p className="text-2xl font-bold text-gray-800">{usersCount || 0}</p>
        </div>
        <div className="p-6 rounded-xl bg-white border shadow">
          <h2 className="text-sm font-medium text-gray-600">Negocios</h2>
          <p className="text-2xl font-bold text-gray-800">
            {businessCount || 0}
          </p>
        </div>
      </div>

      {/* 👇 pasamos datos al client component */}
      <Chart data={chartData} />
    </div>
  );
}
