import { useEffect, useState } from "react";
import {
  Sparkles,
  ScanLine,
  Calculator,
  HeartHandshake,
  Building2,
  Trophy,
  Send,
  ThermometerSun,
  RefreshCcw,
  ShieldAlert,
  Boxes,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Card from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { formatDateTime } from "../utils/formatDate.js";

const ACTION_META = {
  AI_ANALYSIS: { icon: ScanLine, color: "text-primary-dark bg-primary-light" },
  PRIORITY_SCORED: { icon: Calculator, color: "text-primary-dark bg-primary-light" },
  DONATION_CANDIDATE_IDENTIFIED: { icon: HeartHandshake, color: "text-primary-dark bg-primary-light" },
  DONATION_CREATED: { icon: HeartHandshake, color: "text-primary-dark bg-primary-light" },
  NGO_MATCHING_STARTED: { icon: Building2, color: "text-accent-dark bg-accent-light" },
  NGO_RANKED: { icon: Trophy, color: "text-accent-dark bg-accent-light" },
  NOTIFICATION_SENT: { icon: Send, color: "text-accent-dark bg-accent-light" },
  TEMPERATURE_EXCURSION: { icon: ThermometerSun, color: "text-critical bg-critical-light" },
  INSPECTION_FLAGGED: { icon: ShieldAlert, color: "text-critical bg-critical-light" },
  DISCOUNT_SUGGESTED: { icon: Calculator, color: "text-accent-dark bg-accent-light" },
  KEEP_IN_INVENTORY: { icon: Boxes, color: "text-ink-muted bg-line" },
  DONATION_STATUS_UPDATED: { icon: RefreshCcw, color: "text-primary-dark bg-primary-light" },
};

export default function AutomationCenter() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/automation/logs");
      setLogs(data.logs);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout title="Automation Center" subtitle="Every decision FreshLink's automation engine has made, in order">
      <Card>
        {loading ? (
          <LoadingSpinner label="Loading automation logs..." size="lg" />
        ) : logs.length === 0 ? (
          <EmptyState icon={Sparkles} title="No automation activity yet" description="Scan or add a food item to see the automation engine spring into action." />
        ) : (
          <ol className="space-y-0">
            {logs.map((log, idx) => {
              const meta = ACTION_META[log.action] || { icon: Sparkles, color: "text-ink-muted bg-line" };
              const Icon = meta.icon;
              return (
                <li key={log._id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.color}`}>
                      <Icon size={15} />
                    </div>
                    {idx < logs.length - 1 && <div className="w-px flex-1 bg-line" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-xs font-mono text-ink-faint">{formatDateTime(log.createdAt)}</p>
                    <p className="mt-0.5 text-sm text-ink">{log.message}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </DashboardLayout>
  );
}
