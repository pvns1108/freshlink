import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  Boxes,
  HeartHandshake,
  Building2,
  Sparkles,
  Bell,
  Settings,
  Leaf,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/scan", label: "Scan Food", icon: ScanLine },
  { to: "/app/inventory", label: "Inventory", icon: Boxes },
  { to: "/app/donations", label: "Donations", icon: HeartHandshake },
  { to: "/app/ngos", label: "NGOs", icon: Building2 },
  { to: "/app/automation", label: "Automation Center", icon: Sparkles },
  { to: "/app/insights", label: "AI Insights", icon: Sparkles },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-primary-dark text-white flex flex-col transition-transform lg:translate-x-0 lg:static ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
            <Leaf size={19} strokeWidth={2.4} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none">FreshLink</p>
            <p className="text-[11px] text-white/60 mt-0.5">Food Waste Automation</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto thin-scrollbar px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-white text-primary-dark" : "text-white/85 hover:bg-white/10"
                }`
              }
            >
              <Icon size={17} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-[11px] capitalize text-white/60">{user?.role}</p>
            </div>
            <button onClick={logout} aria-label="Log out" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
