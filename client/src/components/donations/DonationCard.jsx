import { Building2, Clock, MapPin, Phone } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import PriorityBadge from "../food/PriorityBadge.jsx";
import Button from "../ui/Button.jsx";
import { DONATION_STATUS_COLORS } from "../../utils/constants.js";
import { expiryLabel, formatDateTime } from "../../utils/formatDate.js";

export default function DonationCard({ donation, onAction }) {
  const statusColor = DONATION_STATUS_COLORS[donation.status] || DONATION_STATUS_COLORS.Pending;

  const actionsFor = (status) => {
    switch (status) {
      case "Pending":
      case "Matched":
        return [{ label: "Accept", to: "Accepted" }, { label: "Cancel", to: "Cancelled", variant: "outline" }];
      case "Accepted":
        return [{ label: "Schedule Pickup", to: "Pickup Scheduled" }, { label: "Cancel", to: "Cancelled", variant: "outline" }];
      case "Pickup Scheduled":
        return [{ label: "Mark Picked Up", to: "Picked Up" }];
      case "Picked Up":
        return [{ label: "Mark Completed", to: "Completed" }];
      default:
        return [];
    }
  };

  return (
    <div className="rounded-xl2 border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink-faint">DONATION #{donation.donationCode}</p>
          <p className="mt-1 font-display text-lg font-semibold text-ink">{donation.foodDescription}</p>
        </div>
        <Badge bg={statusColor.bg} text={statusColor.text}>
          {donation.status}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-ink-muted">Expires</p>
          <p className="font-medium text-ink">{donation.expiryDate ? expiryLabel(donation.expiryDate) : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Priority</p>
          <PriorityBadge level={donation.priorityLevel} />
        </div>
      </div>

      {donation.matchedNGO && (
        <div className="mt-4 rounded-lg bg-bg p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Building2 size={15} className="text-primary" />
            {donation.matchedNGO.name}
            {donation.matchScore != null && (
              <span className="ml-auto font-mono text-xs text-primary-dark">{donation.matchScore}% match</span>
            )}
          </div>
          {donation.matchedNGO.location?.address && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
              <MapPin size={12} /> {donation.matchedNGO.location.address}
            </p>
          )}
          {donation.matchedNGO.contactPhone && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
              <Phone size={12} /> {donation.matchedNGO.contactPhone}
            </p>
          )}
        </div>
      )}

      {donation.pickupTime && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <Clock size={12} /> Pickup: {formatDateTime(donation.pickupTime)}
        </p>
      )}

      <p className="mt-3 text-xs text-ink-faint italic">{donation.safetyDisclaimer}</p>

      {onAction && (
        <div className="mt-4 flex flex-wrap gap-2">
          {actionsFor(donation.status).map((a) => (
            <Button key={a.label} size="sm" variant={a.variant || "primary"} onClick={() => onAction(donation, a.to)}>
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
