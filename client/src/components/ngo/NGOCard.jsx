import { Building2, MapPin, Phone, Mail, PackageCheck, Truck } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import FreshnessRing from "../ui/FreshnessRing.jsx";

export default function NGOCard({ ngo, matchScore, distanceKm, onSendRequest, onContact }) {
  const capacityAvailable = ngo.maxCapacityKg != null && ngo.currentLoadKg != null;
  const available = capacityAvailable ? Math.max(ngo.maxCapacityKg - ngo.currentLoadKg, 0) : null;

  return (
    <div className="rounded-xl2 border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-light text-primary-dark">
            <Building2 size={20} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">{ngo.name}</p>
            {ngo.description && <p className="text-xs text-ink-muted mt-0.5 max-w-xs">{ngo.description}</p>}
          </div>
        </div>
        {matchScore != null && <FreshnessRing pct={matchScore} size={56} label={null} />}
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-ink-muted">
        {ngo.location?.address && (
          <p className="flex items-center gap-1.5">
            <MapPin size={13} />
            {ngo.location.address}
            {distanceKm != null && <span className="ml-1 font-mono text-xs text-ink-faint">· {distanceKm} km</span>}
          </p>
        )}
        {ngo.contactPhone && (
          <p className="flex items-center gap-1.5">
            <Phone size={13} /> {ngo.contactPhone}
          </p>
        )}
        {ngo.contactEmail && (
          <p className="flex items-center gap-1.5">
            <Mail size={13} /> {ngo.contactEmail}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ngo.categoriesAccepted?.map((c) => (
          <Badge key={c} bg="bg-line" text="text-ink-muted">
            {c}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-ink-muted">
          <PackageCheck size={13} />
          {capacityAvailable ? `${available} kg capacity available` : "Capacity: —"}
        </span>
        <span className={`flex items-center gap-1.5 font-medium ${ngo.pickupAvailable ? "text-primary-dark" : "text-ink-faint"}`}>
          <Truck size={13} />
          {ngo.pickupAvailable ? "Pickup available" : "No pickup"}
        </span>
      </div>

      {(onSendRequest || onContact) && (
        <div className="mt-4 flex gap-2">
          {onSendRequest && (
            <Button size="sm" onClick={() => onSendRequest(ngo)}>
              Send Donation Request
            </Button>
          )}
          {onContact && (
            <Button size="sm" variant="outline" onClick={() => onContact(ngo)}>
              Contact
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
