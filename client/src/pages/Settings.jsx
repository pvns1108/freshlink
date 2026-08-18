import { useState } from "react";
import { Save, Info } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Settings() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    organizationName: user?.organizationName || "",
    city: user?.location?.city || "",
    address: user?.location?.address || "",
  });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Profile editing isn't wired to a backend endpoint in this MVP — the
    // account model and every other feature (scanning, donations, NGO
    // matching) are fully functional; this is just a placeholder screen.
    setTimeout(() => {
      setSaving(false);
      toast.info("Profile editing isn't wired up yet in this hackathon build — everything else is fully functional.");
    }, 400);
  };

  return (
    <DashboardLayout title="Settings" subtitle="Your account and organization details">
      <div className="mx-auto max-w-xl space-y-5">
        <Card>
          <h3 className="font-display text-base font-semibold text-ink mb-4">Profile</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
              <input value={form.name} onChange={update("name")} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            {(user?.role === "shop" || user?.role === "ngo") && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Organization Name</label>
                <input value={form.organizationName} onChange={update("organizationName")} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">City</label>
              <input value={form.city} onChange={update("city")} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Address</label>
              <input value={form.address} onChange={update("address")} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <Button type="submit" icon={Save} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-display text-base font-semibold text-ink mb-3">Account</h3>
          <div className="space-y-2 text-sm">
            <Row label="Email" value={user?.email} />
            <Row label="Role" value={user?.role} className="capitalize" />
            <Row label="Account type" value={user?.isDemoAccount ? "Demo account" : "Standard account"} />
          </div>
        </Card>

        <div className="flex items-start gap-2 rounded-lg bg-accent-light px-3 py-2.5 text-xs text-accent-dark">
          <Info size={14} className="mt-0.5 shrink-0" />
          This is a hackathon MVP — profile editing is a stub. Core features (scanning, priority scoring, donation
          automation, NGO matching) are fully functional.
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value, className = "" }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2 last:border-0">
      <span className="text-ink-muted">{label}</span>
      <span className={`font-medium text-ink ${className}`}>{value}</span>
    </div>
  );
}
