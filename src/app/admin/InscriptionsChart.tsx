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

export type ChartPoint = { mois: string; inscriptions: number };

type Props = {
  data: ChartPoint[];
};

export function InscriptionsChart({ data }: Props) {
  const empty = data.length === 0 || data.every((d) => d.inscriptions === 0);

  if (empty) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl bg-brand-50 text-sm text-brand-950/50">
        Aucune inscription enregistrée pour le moment.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6038C7" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6038C7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2F0FF" />
          <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#220E4F99" }} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#220E4F99" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #F2F0FF",
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="inscriptions"
            stroke="#6038C7"
            strokeWidth={2}
            fill="url(#colorIns)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
