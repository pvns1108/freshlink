import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Card from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import Modal from "../components/ui/Modal.jsx";
import Button from "../components/ui/Button.jsx";
import NGOCard from "../components/ngo/NGOCard.jsx";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function NGOs() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModalNgo, setRequestModalNgo] = useState(null);
  const [contactNgo, setContactNgo] = useState(null);
  const [eligibleItems, setEligibleItems] = useState([]);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ngos/nearby");
      setNgos(data.ngos);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRequestModal = async (ngo) => {
    setRequestModalNgo(ngo);
    try {
      const { data } = await api.get("/food", { params: { status: "Near Expiry" } });
      const candidates = await api.get("/food", { params: { status: "Donation Candidate" } });
      setEligibleItems([...data.items, ...candidates.data.items]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sendRequest = async (item) => {
    setSending(true);
    try {
      const { data } = await api.post(`/food/${item._id}/donate`);
      toast.success(
        data.ngoMatches?.length
          ? `Donation listed — best match: ${data.ngoMatches[0].ngo.name} (${data.ngoMatches[0].matchScore}%).`
          : "Donation listed."
      );
      setRequestModalNgo(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout title="NGOs" subtitle="Nearby partner organizations, ranked by match score">
      {loading ? (
        <LoadingSpinner label="Ranking nearby NGOs..." size="lg" />
      ) : ngos.length === 0 ? (
        <Card>
          <EmptyState icon={Building2} title="No NGOs found" description="Seed the database to populate demo NGOs." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ngos.map((ngo) => (
            <NGOCard
              key={ngo._id}
              ngo={ngo}
              matchScore={ngo.matchScore}
              distanceKm={ngo.distanceKm}
              onSendRequest={openRequestModal}
              onContact={setContactNgo}
            />
          ))}
        </div>
      )}

      <Modal open={!!requestModalNgo} onClose={() => setRequestModalNgo(null)} title={`Send donation to ${requestModalNgo?.name || ""}`}>
        <p className="mb-3 text-sm text-ink-muted">
          FreshLink automatically routes the donation to the best-matched NGO based on distance, category fit and
          capacity — which may or may not be this exact NGO. Pick which item you'd like to list:
        </p>
        {eligibleItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">No near-expiry or donation-candidate items right now.</p>
        ) : (
          <div className="space-y-2">
            {eligibleItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-lg border border-line p-3">
                <div>
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink-muted">
                    {item.quantity} {item.unit} · {item.category}
                  </p>
                </div>
                <Button size="sm" onClick={() => sendRequest(item)} disabled={sending}>
                  List for Donation
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!contactNgo} onClose={() => setContactNgo(null)} title={contactNgo?.name}>
        {contactNgo && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-ink-muted">Contact:</span> {contactNgo.contactName}
            </p>
            <p>
              <span className="text-ink-muted">Phone:</span> {contactNgo.contactPhone}
            </p>
            <p>
              <span className="text-ink-muted">Email:</span>{" "}
              <a href={`mailto:${contactNgo.contactEmail}`} className="text-primary hover:underline">
                {contactNgo.contactEmail}
              </a>
            </p>
            <p>
              <span className="text-ink-muted">Address:</span> {contactNgo.location?.address}
            </p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
