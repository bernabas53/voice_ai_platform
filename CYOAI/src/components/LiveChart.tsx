import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTheme } from "../ThemeContext";

interface CallLog {
  name: string;
  caller_name?: string;
  phone_number?: string;
  intent?: string;
  summary?: string;
  status?: string;
}

interface LiveChartProps {
  callLogs: CallLog[];
  loading: boolean;
}

export default function LiveChart({ callLogs, loading }: LiveChartProps) {
  const { theme } = useTheme();
  // Group by intent
  const data = Object.values(
    callLogs.reduce<Record<string, { category: string; count: number }>>((acc, log) => {
      const key = log.intent ?? "Unknown";
      acc[key] = acc[key] || { category: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  );

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>;
  }
  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No data to display</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
      <div className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Live Calls by Intent</div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
          <XAxis dataKey="category" stroke={theme === "dark" ? "#d1d5db" : "#374151"} tick={{ fill: theme === "dark" ? "#d1d5db" : "#374151" }} />
          <YAxis allowDecimals={false} stroke={theme === "dark" ? "#d1d5db" : "#374151"} tick={{ fill: theme === "dark" ? "#d1d5db" : "#374151" }} />
          <Tooltip contentStyle={{ background: theme === "dark" ? "#1f2937" : "#fff", color: theme === "dark" ? "#fff" : "#111" }} />
          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
