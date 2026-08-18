import { useEffect, useMemo, useState } from "react";
import { Plus, ScanLine, Boxes, ThermometerSun } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import FoodTable from "../components/food/FoodTable.jsx";
import AddFoodModal from "../components/food/AddFoodModal.jsx";
import Modal from "../components/ui/Modal.jsx";
import TemperatureChart from "../components/charts/TemperatureChart.jsx";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const FILTERS = ["All", "Fresh", "Near Expiry", "Donation Candidate", "Inspection Required", "Expired"];
const SORTS = [
  { value: "", label: "Newest" },
  { value: "expiry", label: "Expiry" },
  { value: "priority", label: "Priority" },
  { value: "quantity", label: "Quantity" },
];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [tempReadings, setTempReadings] = useState([]);
  const [tempThreshold, setTempThreshold] = useState(8);
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== "All") params.status = filter;
      if (sort) params.sort = sort;
      const { data } = await api.get("/food", { params });
      setItems(data.items);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sort]);

  useEffect(() => {
    if (user?.role !== "shop" && user?.role !== "admin") return;
    (async () => {
      try {
        const { data } = await api.get("/temperature");
        setTempReadings(data.readings);
        setTempThreshold(data.thresholdC);
      } catch {
        // Cold-chain monitoring is supplementary — fail silently if unavailable.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/food/${editing._id}`, form);
        toast.success("Food item updated.");
      } else {
        await api.post("/food", form);
        toast.success("Food item added — priority & automation calculated.");
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/food/${deleting._id}`);
      toast.success("Food item deleted.");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDonate = async (item) => {
    try {
      const { data } = await api.post(`/food/${item._id}/donate`);
      toast.success(
        data.ngoMatches?.length
          ? `Donation created — matched with ${data.ngoMatches[0].ngo.name} (${data.ngoMatches[0].matchScore}%).`
          : "Donation created."
      );
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const counts = useMemo(() => {
    const c = { All: items.length };
    FILTERS.slice(1).forEach((f) => {
      c[f] = items.filter((i) => i.status === f).length;
    });
    return c;
  }, [items]);

  return (
    <DashboardLayout
      title="Food Inventory"
      subtitle="All scanned and manually added food items"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" icon={ScanLine} onClick={() => navigate("/app/scan")}>
            Scan
          </Button>
          <Button icon={Plus} onClick={() => { setEditing(null); setModalOpen(true); }}>
            Add Food
          </Button>
        </div>
      }
    >
      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f ? "bg-primary text-white" : "bg-bg text-ink-muted hover:bg-line"
                }`}
              >
                {f} {counts[f] !== undefined && <span className="opacity-70">({counts[f]})</span>}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading inventory..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No food items here yet"
            description="Scan a food photo or add an item manually to get started."
            action={<Button onClick={() => setModalOpen(true)}>Add Food Manually</Button>}
          />
        ) : (
          <FoodTable
            items={items}
            onEdit={(item) => {
              setEditing(item);
              setModalOpen(true);
            }}
            onDelete={setDeleting}
            onDonate={handleDonate}
          />
        )}
      </Card>

      {(user?.role === "shop" || user?.role === "admin") && tempReadings.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center gap-2">
            <ThermometerSun size={16} className="text-critical" />
            <h3 className="font-display text-base font-semibold text-ink">Cold-Chain Temperature Monitoring</h3>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Simulated IoT sensor history — demonstrates how FreshLink could integrate real cold-chain sensors.
          </p>
          {tempReadings.some((r) => r.excursion) && (
            <p className="mt-2 rounded-lg bg-critical-light px-3 py-2 text-xs font-medium text-critical">
              Temperature excursion detected — inspection recommended.
            </p>
          )}
          <div className="mt-3">
            <TemperatureChart readings={tempReadings} thresholdC={tempThreshold} />
          </div>
        </Card>
      )}

      <AddFoodModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initialValue={editing}
        submitting={submitting}
      />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete food item?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">
          This will permanently remove <span className="font-medium text-ink">{deleting?.name}</span> from your inventory.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
