"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MetricsMainChartProps {
  data: {
    label: string;
    value: number;
  }[];
}

export default function MetricsMainChart({
  data,
}: MetricsMainChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const bestDay =
    data.length > 0
      ? data.reduce((prev, current) =>
          current.value > prev.value ? current : prev
        )
      : null;

  return (
    <div className="premium-home-card rounded-[28px] p-5 text-white sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">Agendamentos</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Evolução no período
          </h3>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
              Total
            </p>
            <p className="mt-1 text-lg font-bold text-white">{total}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">
              Melhor dia
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {bestDay ? bestDay.label : "--"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(43 96% 56%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(43 96% 56%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

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
              allowDecimals={false}
            />

            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
              contentStyle={{
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                color: "#fff",
              }}
              labelStyle={{ color: "#d4d4d8" }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(43 96% 56%)"
              strokeWidth={3}
              fill="url(#bookingsGradient)"
              activeDot={{
                r: 6,
                stroke: "hsl(43 96% 56%)",
                strokeWidth: 2,
                fill: "#0a0a0a",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}