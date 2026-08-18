import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { formatDateTime } from "../../utils/formatDate.js";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications.slice(0, 6));
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently ignore — the bell just stays quiet if the API/db is unavailable.
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2.5 text-ink-muted hover:bg-line"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-critical px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl2 border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-semibold text-sm text-ink">Notifications</p>
            <Link to="/app/notifications" onClick={() => setOpen(false)} className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="max-h-80 overflow-y-auto thin-scrollbar">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">You're all caught up.</p>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className={`border-b border-line px-4 py-3 last:border-0 ${!n.isRead ? "bg-primary-light/40" : ""}`}>
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{n.message}</p>
                  <p className="text-[11px] text-ink-faint mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
