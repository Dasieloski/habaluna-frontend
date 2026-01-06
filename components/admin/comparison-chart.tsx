"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { monthlyComparison } from "@/lib/mock-data"

export function ComparisonChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            tickMargin={10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
              padding: "12px 16px",
            }}
            labelStyle={{ color: "#0f172a", fontWeight: 600 }}
            formatter={(value: number) => [`€${value.toLocaleString()}`, ""]}
          />
          <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
          <Bar dataKey="lastYear" name="2023" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="thisYear" name="2024" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
