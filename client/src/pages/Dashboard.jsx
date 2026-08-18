import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  AlertTriangle,
  HeartHandshake,
  Leaf,
  Scale,
  Truck,
  Users,
  Building2,
  ShieldAlert,
  Percent,
  ScanLine,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import StatusPieChart from "../components/charts/StatusPieChart.jsx";
import WasteTrendChart from "../components/charts/WasteTrendChart.jsx";
import DonationStatusChart from "../components/charts/DonationStatusChart.jsx";
import ExpiryTimelineChart from "../components/charts/ExpiryTimelineChart.jsx";
import DonationCard from "../components/donations/DonationCard.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import api from "../services/api.js";
import { expiryLabel } from "../utils/formatDate.js";

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbDown, setDbDown] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [analyticsRes, foodRes, donationsRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/food"),
        api.get("/donations"),
      ]);
      setAnalytics(analyticsRes.data);
      setFoodItems(foodRes.data.items);
      setDonations(donationsRes.data.donations);
      setDbDown(false);
    } catch (err) {
      if (err.response?.status === 503) setDbDown(true);
      else toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDonationAction = async (donation, nextStatus) => {
    try {
      await api.put(`/donations/${donation._id}`, { status: nextStatus });
      toast.success(`Donation #${donation.donationCode} marked "${nextStatus}".`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <LoadingSpinner label="Loading your dashboard..." size="lg" />
      </DashboardLayout>
    );
  }

  if (dbDown) {
    return (
      <DashboardLayout title="Dashboard">
        <Card>
          <EmptyState
            icon={ShieldAlert}
            title="Database not connected"
            description="FreshLink's API is running, but no database is connected yet. Set MONGO_URI in server/.env, or allow outbound network access so the built-in in-memory MongoDB can start automatically."
          />
        </Card>
      </DashboardLayout>
    );
  }

  const { cards, statusDistribution, monthlyTrend, donationStatusBreakdown, expiryTimeline } = analytics;

  return (
    <DashboardLayout
      title={`Welcome back, ${user.name.split(" ")[0]}`}
      subtitle={`${capitalize(user.role)} dashboard · FreshLink`}
      actions={
        <Button icon={ScanLine} onClick={() => navigate("/app/scan")}>
          Scan Food
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Food Items" value={cards.totalFoodItems} icon={Boxes} accent="primary" />
        <StatCard label="Near Expiry" value={cards.nearExpiry} icon={AlertTriangle} accent="accent" />
        <StatCard label="Donation Candidates" value={cards.donationCandidates} icon={HeartHandshake} accent="primary" />
        <StatCard label="Items Saved" value={cards.itemsSaved} icon={Leaf} accent="primary" />
        <StatCard label="Waste Prevented" value={`${cards.foodWastePreventedKg} kg`} icon={Scale} accent="primary" hint="Estimate" />
        <StatCard label="Active Donations" value={cards.activeDonations} icon={Truck} accent="accent" />
      </div>

      {user.role === "admin" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatCard label="Total Users" value={cards.totalUsers} icon={Users} accent="primary" />
          <StatCard label="Active NGOs" value={cards.activeNGOs} icon={Building2} accent="primary" />
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-base font-semibold text-ink">Food Status Distribution</h3>
          <StatusPieChart data={statusDistribution} />
        </Card>
        <Card>
          <h3 className="font-display text-base font-semibold text-ink">Monthly Waste Reduction</h3>
          <WasteTrendChart data={monthlyTrend} />
        </Card>
        <Card>
          <h3 className="font-display text-base font-semibold text-ink">Donations by Status</h3>
          <DonationStatusChart data={donationStatusBreakdown} />
        </Card>
        <Card>
          <h3 className="font-display text-base font-semibold text-ink">Expiry Timeline</h3>
          <ExpiryTimelineChart data={expiryTimeline} />
        </Card>
      </div>

      {user.role === "shop" && <SmartActions items={foodItems} onAct={() => navigate("/app/inventory")} />}
      {user.role === "ngo" && (
        <AvailableDonations donations={donations} onAction={handleDonationAction} />
      )}
      {user.role === "household" && foodItems.length === 0 && (
        <Card className="mt-6">
          <EmptyState
            icon={ScanLine}
            title="Your inventory is empty"
            description="Scan your first food item to see AI freshness screening and automated donation matching in action."
            action={<Button onClick={() => navigate("/app/scan")}>Scan Food</Button>}
          />
        </Card>
      )}
    </DashboardLayout>
  );
}

function SmartActions({ items, onAct }) {
  const suggestions = items
    .filter((i) => i.status === "Near Expiry" || i.status === "Donation Candidate" || i.status === "Inspection Required")
    .slice(0, 6);

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink">Smart Actions</h3>
        <Percent size={16} className="text-ink-faint" />
      </div>
      {suggestions.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No urgent items right now — nice and fresh!</p>
      ) : (
        <div className="mt-3 divide-y divide-line">
          {suggestions.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {item.name} — {expiryLabel(item.expiryDate)}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {item.status === "Inspection Required"
                    ? "Visual deterioration detected → Inspection required"
                    : item.discountSuggested
                    ? `Recommended discount: ${item.discountSuggested}%`
                    : `Donate ${item.quantity} ${item.unit}`}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={onAct}>
                Review
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function AvailableDonations({ donations, onAction }) {
  const relevant = donations
    .filter((d) => ["Pending", "Matched"].includes(d.status))
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (order[a.priorityLevel] ?? 4) - (order[b.priorityLevel] ?? 4);
    });

  return (
    <div className="mt-6">
      <h3 className="font-display text-base font-semibold text-ink mb-3">Available Donations Near You</h3>
      {relevant.length === 0 ? (
        <Card>
          <EmptyState icon={HeartHandshake} title="No open donations right now" description="Check back soon — new donation candidates appear here as they're matched." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {relevant.map((d) => (
            <DonationCard key={d._id} donation={d} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
