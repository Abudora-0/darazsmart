"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface PricePoint {
  timestamp: string;
  price: number;
}

export function PriceHistoryChart({ data }: { data: PricePoint[] }) {
  if (data.length < 2) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Price history will appear after tracking begins.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.timestamp), "MMM d"),
    price: d.price,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis
          tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
          width={55}
        />
        <Tooltip
          formatter={(v) => [`Rs. ${Number(v).toLocaleString()}`, "Price"]}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#6c5ce7"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
