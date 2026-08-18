import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, CalendarClock, Leaf, Info } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Card from "../components/ui/Card.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { daysUntil } from "../utils/formatDate.js";

const AVG_ITEM_WEIGHT_KG = 0.6;
const AT_RISK_STATUSES = ["Near Expiry", "Donation Candidate", "Inspection Required"];

export default function AIInsights() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/food");
        setItems(data.items);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="AI Insights">
        <LoadingSpinner label="Crunching insights..." size="lg" />
      </DashboardLayout>
    );
  }

  const atRisk = items.filter((i) => AT_RISK_STATUSES.includes(i.status));

  const categoryRisk = {};
  atRisk.forEach((i) => {
    categoryRisk[i.category] = (categoryRisk[i.category] || 0) + i.quantity;
  });
  const totalRiskQty = Object.values(categoryRisk).reduce((s, v) => s + v, 0) || 1;
  const topCategory = Object.entries(categoryRisk).sort((a, b) => b[1] - a[1])[0];
  const topCategoryPct = topCategory ? Math.round((topCategory[1] / totalRiskQty) * 100) : 0;

  const expiringSoonCount = items.filter((i) => {
    const d = daysUntil(i.expiryDate);
    return d >= 0 && d <= 3 && !["Donated", "Used", "Discarded"].includes(i.status);
  }).length;

  const kgPreventable = Math.round(atRisk.reduce((s, i) => s + i.quantity, 0) * AVG_ITEM_WEIGHT_KG * 10) / 10;

  const insights = [
    {
      icon: TrendingUp,
      color: "text-primary-dark bg-primary-light",
      text: topCategory
        ? `${topCategoryPct}% of your current food waste risk comes from ${topCategory[0].toLowerCase()} products.`
        : "No significant waste-risk concentration detected right now.",
    },
    {
      icon: CalendarClock,
      color: "text-accent-dark bg-accent-light",
      text: `${expiringSoonCount} item${expiringSoonCount === 1 ? "" : "s"} may expire within 3 days.`,
    },
    {
      icon: Leaf,
      color: "text-primary-dark bg-primary-light",
      text: `Donating these items could prevent approximately ${kgPreventable} kg of food waste.`,
    },
    {
      icon: Sparkles,
      color: "text-accent-dark bg-accent-light",
      text: "Peak waste risk tends to occur on weekends, based on typical consumption patterns.",
    },
  ];

  return (
    <DashboardLayout title="AI Insights" subtitle="Patterns FreshLink noticed across your inventory">
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent-light px-3 py-2 text-xs font-medium text-accent-dark">
        <Info size={14} />
        These insights are estimates derived from your current demo/seeded data — not guarantees.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight, i) => (
          <Card key={i} className="flex items-start gap-3">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${insight.color}`}>
              <insight.icon size={18} />
            </div>
            <p className="text-sm text-ink pt-1.5">{insight.text}</p>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
