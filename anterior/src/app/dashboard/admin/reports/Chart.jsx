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
    return <p className="text-sm text-gray-500">No hay datos suficientes</p>;
  }

  return (
    <div className="p-6 rounded-xl bg-white border shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Actividad semanal
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#2563eb"
            name="Usuarios"
          />
          <Line
            type="monotone"
            dataKey="business"
            stroke="#16a34a"
            name="Negocios"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
