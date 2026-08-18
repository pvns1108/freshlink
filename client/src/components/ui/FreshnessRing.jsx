// The product's signature visual device: a radial "freshness ring" used to
// show AI confidence and priority scores as a ring rather than a bare number
// or a generic progress bar.
export default function FreshnessRing({ pct = 0, size = 72, color, label, sub }) {
  const style = {
    "--ring-size": `${size}px`,
    "--ring-pct": Math.max(0, Math.min(100, pct)),
  };
  if (color) style["--ring-color"] = color;

  return (
    <div className="flex items-center gap-3">
      <div className="freshness-ring" style={style}>
        <span style={{ fontSize: size * 0.22 }}>{Math.round(pct)}%</span>
      </div>
      {(label || sub) && (
        <div>
          {label && <p className="text-sm font-semibold text-ink">{label}</p>}
          {sub && <p className="text-xs text-ink-muted">{sub}</p>}
        </div>
      )}
    </div>
  );
}
