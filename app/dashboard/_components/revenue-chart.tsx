"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueChartProps {
  data: {
    label: string;
    value: number;
  }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="premium-home-card rounded-[28px] p-5 text-white sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">Receita</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Faturamento por dia
          </h3>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
            Total do período
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {total.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      <div className="mt-6 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={18}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(value) => {
                const numericValue = Number(value ?? 0);

                return numericValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }}
              contentStyle={{
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                color: "#fff",
              }}
              labelStyle={{ color: "#d4d4d8" }}
            />

            <Bar dataKey="value" radius={[10, 10, 4, 4]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.value > 0
                      ? "hsl(43 96% 56%)"
                      : "rgba(255,255,255,0.12)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}