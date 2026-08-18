import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = {
  Fresh: "#146B4B",
  "Near Expiry": "#E8A33D",
  "Donation Candidate": "#4C9A7C",
  "Inspection Required": "#DC2626",
};

export default function StatusPieChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return <p className="py-16 text-center text-sm text-ink-muted">No food status data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || "#94A39B"} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#E1E7E1", fontSize: 13 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#5B6B62" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
