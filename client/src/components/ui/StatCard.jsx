export default function StatCard({ label, value, icon: Icon, hint, accent = "primary" }) {
  const accentClasses = {
    primary: "bg-primary-light text-primary-dark",
    accent: "bg-accent-light text-accent-dark",
    critical: "bg-critical-light text-critical",
  };
  return (
    <div className="bg-surface border border-line rounded-xl2 shadow-card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="mt-2 text-2xl font-display font-semibold text-ink">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
      </div>
      {Icon && (
        <div className={`rounded-full p-2.5 ${accentClasses[accent]}`}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
      )}
    </div>
  );
}
