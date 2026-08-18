import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function WasteTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-muted">No monthly trend data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="itemsSaved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#146B4B" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#146B4B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5B6B62" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#5B6B62" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#E1E7E1", fontSize: 13 }} />
        <Area type="monotone" dataKey="itemsSaved" name="Items saved" stroke="#146B4B" strokeWidth={2} fill="url(#itemsSaved)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
