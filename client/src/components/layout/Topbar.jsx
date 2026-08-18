import { Menu } from "lucide-react";
import NotificationBell from "../notifications/NotificationBell.jsx";

export default function Topbar({ title, subtitle, onMenuClick, actions }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-bg/90 backdrop-blur px-4 py-4 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-muted hover:bg-line lg:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="truncate text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {actions}
        <NotificationBell />
      </div>
    </header>
  );
}
