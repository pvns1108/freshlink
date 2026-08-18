import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import FreshnessRing from "../ui/FreshnessRing.jsx";
import PriorityBadge from "./PriorityBadge.jsx";
import { formatDate } from "../../utils/formatDate.js";

const CONDITION_STYLES = {
  Fresh: { color: "#146B4B", icon: CheckCircle2 },
  Normal: { color: "#146B4B", icon: CheckCircle2 },
  "Near Expiry": { color: "#E8A33D", icon: AlertTriangle },
  "Possible Deterioration": { color: "#DC2626", icon: ShieldAlert },
  "Inspection Required": { color: "#DC2626", icon: ShieldAlert },
};

export default function AIResultPanel({
  result,
  expiryDate,
  onExpiryDateChange,
  priority,
  aiMode,
}) {
  if (!result) return null;

  const style = CONDITION_STYLES[result.condition] || CONDITION_STYLES.Normal;
  const Icon = style.icon;

  return (
    <div className="space-y-5">
      {aiMode === "demo" && (
        <div className="flex items-center gap-2 rounded-lg bg-accent-light px-3 py-2 text-xs font-medium text-accent-dark">
          <Info size={14} />
          Running in Demo AI Mode — results are deterministic mock output, not a live vision model.
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between rounded-xl2 border border-line bg-bg p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Food detected</p>
          <p className="mt-1 font-display text-xl font-semibold text-ink">{result.foodType}</p>
        </div>
        <FreshnessRing pct={(result.confidence || 0) * 100} color={style.color} label="AI Confidence" sub="Visual screening" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl2 border border-line p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">Condition</p>
          <div className="flex items-center gap-2" style={{ color: style.color }}>
            <Icon size={18} />
            <p className="font-semibold">{result.condition}</p>
          </div>
          {result.possibleIssues?.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-ink-muted list-disc list-inside">
              {result.possibleIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl2 border border-line p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">Expiry date</p>
          {result.expiryDetected ? (
            <p className="font-semibold text-ink">{formatDate(expiryDate)}</p>
          ) : (
            <div>
              <p className="text-sm text-critical font-medium mb-2">
                Expiry date could not be confidently detected.
              </p>
              <input
                type="date"
                value={expiryDate ? new Date(expiryDate).toISOString().slice(0, 10) : ""}
                onChange={(e) => onExpiryDateChange(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {priority && (
        <div className="rounded-xl2 border border-line p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Priority</p>
            <PriorityBadge level={priority.priorityLevel} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-ink">{priority.priorityScore}</span>
            <span className="text-xs text-ink-muted">/ 100</span>
          </div>
          <p className="mt-2 text-sm font-medium text-primary-dark">Recommended: {priority.recommendedAction}</p>
          {priority.reasons?.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-ink-muted">
              {priority.reasons.map((r) => (
                <li key={r} className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-critical-light px-3 py-2.5 text-xs text-critical">
        <ShieldAlert size={15} className="mt-0.5 shrink-0" />
        <p>{result.disclaimer || "AI screening is indicative only. Inspect food before consumption or donation."}</p>
      </div>
    </div>
  );
}
