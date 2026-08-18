import { Trash2, HeartHandshake, Pencil } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import PriorityBadge from "./PriorityBadge.jsx";
import { expiryLabel, formatDate } from "../../utils/formatDate.js";

export default function FoodTable({ items, onEdit, onDelete, onDonate }) {
  return (
    <div className="overflow-x-auto thin-scrollbar">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <th className="px-3 py-3">Food</th>
            <th className="px-3 py-3">Category</th>
            <th className="px-3 py-3">Quantity</th>
            <th className="px-3 py-3">Expiry</th>
            <th className="px-3 py-3">Condition</th>
            <th className="px-3 py-3">Priority</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-b border-line last:border-0 hover:bg-bg/70">
              <td className="px-3 py-3 font-medium text-ink">{item.name}</td>
              <td className="px-3 py-3 text-ink-muted">{item.category}</td>
              <td className="px-3 py-3 text-ink-muted">
                {item.quantity} {item.unit}
              </td>
              <td className="px-3 py-3">
                <p className="text-ink">{formatDate(item.expiryDate)}</p>
                <p className="text-xs text-ink-faint">{expiryLabel(item.expiryDate)}</p>
              </td>
              <td className="px-3 py-3 text-ink-muted">{item.aiCondition}</td>
              <td className="px-3 py-3">
                <PriorityBadge level={item.priorityLevel} />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-1">
                  {(item.status === "Near Expiry" || item.status === "Donation Candidate") && onDonate && (
                    <button
                      onClick={() => onDonate(item)}
                      className="rounded-lg p-2 text-primary hover:bg-primary-light"
                      title="Donate"
                    >
                      <HeartHandshake size={16} />
                    </button>
                  )}
                  <button onClick={() => onEdit(item)} className="rounded-lg p-2 text-ink-muted hover:bg-bg" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(item)} className="rounded-lg p-2 text-critical hover:bg-critical-light" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
