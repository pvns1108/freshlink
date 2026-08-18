import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { formatDateTime } from "../../utils/formatDate.js";

export default function TemperatureChart({ readings, thresholdC = 8 }) {
  if (!readings || readings.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-muted">No temperature readings logged yet.</p>;
  }

  const data = readings.map((r) => ({
    time: new Date(r.recordedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    temp: r.temperatureC,
    excursion: r.excursion,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E1" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#5B6B62" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#5B6B62" }} axisLine={false} tickLine={false} unit="°C" />
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#E1E7E1", fontSize: 13 }} />
        <ReferenceLine y={thresholdC} stroke="#DC2626" strokeDasharray="4 4" label={{ value: `${thresholdC}°C threshold`, fontSize: 11, fill: "#DC2626", position: "insideTopLeft" }} />
        <Line type="monotone" dataKey="temp" stroke="#146B4B" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
