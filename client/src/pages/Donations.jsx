import { useEffect, useState } from "react";
import { HeartHandshake } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Card from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import DonationCard from "../components/donations/DonationCard.jsx";
import { DONATION_STATUSES } from "../utils/constants.js";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

const FILTERS = ["All", ...DONATION_STATUSES];

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== "All" ? { status: filter } : {};
      const { data } = await api.get("/donations", { params });
      setDonations(data.donations);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleAction = async (donation, nextStatus) => {
    try {
      await api.put(`/donations/${donation._id}`, { status: nextStatus });
      toast.success(`Donation #${donation.donationCode} marked "${nextStatus}".`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Donations" subtitle="Track every donation from listing to pickup completion">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? "bg-primary text-white" : "bg-surface border border-line text-ink-muted hover:bg-line"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading donations..." size="lg" />
      ) : donations.length === 0 ? (
        <Card>
          <EmptyState icon={HeartHandshake} title="No donations found" description="Donations created from Scan Food or Inventory will show up here." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {donations.map((d) => (
            <DonationCard key={d._id} donation={d} onAction={handleAction} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
