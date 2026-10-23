"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export default function RadarThreatChart({ data }: { data: any[] }) {
  return (
    <div className="bg-[#0d1117] rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">Attack Category Radar</h2>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} outerRadius="62%">
          <PolarGrid stroke="#2a2a2a" />
          <PolarAngleAxis dataKey="category" stroke="#bbb" tick={{ fontSize: 12, fill: "#cbd5e1" }} />
          <Radar
            name="Threat Level"
            dataKey="value"
            fill="#ff4d4d"
            fillOpacity={0.5}
            stroke="#ff1a1a"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
