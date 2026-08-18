import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} rounded-xl2 bg-surface shadow-card border border-line max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-muted hover:bg-bg" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 thin-scrollbar">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
