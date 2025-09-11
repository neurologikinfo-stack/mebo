import { supabaseServer } from "@/utils/supabase/server";
import Chart from "./Chart"; // 👈 componente client

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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Reportes</h1>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-card text-card-foreground border border-border shadow">
          <h2 className="text-sm font-medium text-muted-foreground">
            Usuarios
          </h2>
          <p className="text-2xl font-bold">{usersCount || 0}</p>
        </div>
        <div className="p-6 rounded-xl bg-card text-card-foreground border border-border shadow">
          <h2 className="text-sm font-medium text-muted-foreground">
            Negocios
          </h2>
          <p className="text-2xl font-bold">{businessCount || 0}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6 rounded-xl bg-card text-card-foreground border border-border shadow">
        <h2 className="text-lg font-semibold mb-4">
          Usuarios y Negocios por semana
        </h2>
        <Chart data={chartData} />
      </div>
    </div>
  );
}
