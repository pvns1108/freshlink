import { useEffect, useState } from "react";
import { Bell, AlertTriangle, HeartHandshake, Building2, Truck, ShieldAlert, Info } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Card from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { formatDateTime } from "../utils/formatDate.js";

const TYPE_META = {
  expiry: { icon: AlertTriangle, color: "text-accent-dark bg-accent-light" },
  donation: { icon: HeartHandshake, color: "text-primary-dark bg-primary-light" },
  ngo: { icon: Building2, color: "text-primary-dark bg-primary-light" },
  pickup: { icon: Truck, color: "text-accent-dark bg-accent-light" },
  inspection: { icon: ShieldAlert, color: "text-critical bg-critical-light" },
  system: { icon: Info, color: "text-ink-muted bg-line" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
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

  const markRead = async (n) => {
    if (n.isRead) return;
    try {
      await api.put(`/notifications/${n._id}/read`);
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Notifications" subtitle="Every automated alert FreshLink has sent you">
      <Card padded={false}>
        {loading ? (
          <LoadingSpinner label="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="You'll see expiry alerts, donation matches and pickup updates here." />
        ) : (
          <div className="divide-y divide-line">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              const Icon = meta.icon;
              return (
                <button
                  key={n._id}
                  onClick={() => markRead(n)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-bg/70 ${
                    !n.isRead ? "bg-primary-light/30" : ""
                  }`}
                >
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${meta.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-ink-faint">{formatDateTime(n.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
