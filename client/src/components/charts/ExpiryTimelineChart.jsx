import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = {
  "Expired": "#7A1F1F",
  "0-1 days": "#DC2626",
  "2-3 days": "#E8A33D",
  "4-7 days": "#4C9A7C",
  "8+ days": "#146B4B",
};

export default function ExpiryTimelineChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-muted">No active inventory to chart.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: "#5B6B62" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#5B6B62" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#E1E7E1", fontSize: 13 }} />
        <Bar dataKey="count" name="Items" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.bucket} fill={COLORS[d.bucket] || "#94A39B"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
