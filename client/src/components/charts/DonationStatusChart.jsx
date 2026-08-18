import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = {
  Pending: "#94A39B",
  Matched: "#4C9A7C",
  Accepted: "#146B4B",
  "Pickup Scheduled": "#E8A33D",
  "Picked Up": "#B97A1F",
  Completed: "#0E4F37",
  Cancelled: "#DC2626",
};

export default function DonationStatusChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-muted">No donations yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
        <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#5B6B62" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 12, fill: "#5B6B62" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#E1E7E1", fontSize: 13 }} />
        <Bar dataKey="count" name="Donations" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.status} fill={COLORS[d.status] || "#94A39B"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
