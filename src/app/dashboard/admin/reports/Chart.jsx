"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Chart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No hay datos suficientes</p>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-card text-card-foreground border border-border shadow">
      <h2 className="text-lg font-semibold mb-4">Actividad semanal</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="users"
            stroke="hsl(var(--primary))"
            name="Usuarios"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="business"
            stroke="hsl(var(--secondary))"
            name="Negocios"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
