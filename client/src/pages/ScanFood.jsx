import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, HeartHandshake, ListChecks, Sparkles } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import ScanUploader from "../components/food/ScanUploader.jsx";
import AIResultPanel from "../components/food/AIResultPanel.jsx";
import { CATEGORIES } from "../utils/constants.js";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

const STEPS = ["Upload", "Analyze", "Review & Save"];

export default function ScanFood() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [details, setDetails] = useState({ category: "Other", quantity: 1, unit: "units", storageLocation: "", temperatureC: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file && !foodName.trim()) {
      toast.error("Upload an image or enter a food name first.");
      return;
    }
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (file) formData.append("image", file);
      formData.append("foodName", foodName);
      const { data } = await api.post("/food/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ ...data, expiryDetected: data.expiry.detected });
      setExpiryDate(data.expiry.detected ? data.expiry.date : "");
      setDetails((d) => ({ ...d, category: guessCategory(data.foodDetected) }));
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!expiryDate) {
      toast.error("Please set an expiry date before saving.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/food", {
        name: result.foodDetected,
        category: details.category,
        quantity: Number(details.quantity) || 1,
        unit: details.unit,
        expiryDate,
        storageLocation: details.storageLocation,
        temperatureC: details.temperatureC === "" ? null : Number(details.temperatureC),
        notes: details.notes,
        skipAI: true,
        condition: result.condition,
        aiConfidence: result.confidence,
        possibleIssues: result.possibleIssues,
        inspectionRequired: result.inspectionRequired,
        aiMode: result.aiMode,
      });
      setOutcome(data);
      toast.success("Food item saved — automation engine ran successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStep(0);
    setFile(null);
    setFoodName("");
    setResult(null);
    setExpiryDate("");
    setOutcome(null);
    setDetails({ category: "Other", quantity: 1, unit: "units", storageLocation: "", temperatureC: "", notes: "" });
  };

  return (
    <DashboardLayout title="Scan Food" subtitle="Upload a photo or enter details manually for AI-assisted screening">
      <div className="mx-auto max-w-2xl">
        <Stepper current={step} />

        {outcome ? (
          <OutcomePanel outcome={outcome} onScanAnother={reset} onViewInventory={() => navigate("/app/inventory")} onViewDonations={() => navigate("/app/donations")} />
        ) : (
          <Card className="mt-6">
            {step < 2 && (
              <>
                <ScanUploader onFileSelected={setFile} onManualFoodName={setFoodName} foodName={foodName} disabled={analyzing} />
                <Button className="mt-5 w-full" onClick={handleAnalyze} disabled={analyzing} icon={Sparkles}>
                  {analyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </>
            )}

            {step === 2 && result && (
              <div className="space-y-6">
                <AIResultPanel result={result} expiryDate={expiryDate} onExpiryDateChange={setExpiryDate} aiMode={result.aiMode} />

                <div className="border-t border-line pt-5">
                  <p className="mb-3 text-sm font-semibold text-ink">Confirm details before saving</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <LabeledInput label="Category">
                      <select value={details.category} onChange={(e) => setDetails((d) => ({ ...d, category: e.target.value }))} className="input">
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </LabeledInput>
                    <LabeledInput label="Quantity">
                      <input type="number" min="1" value={details.quantity} onChange={(e) => setDetails((d) => ({ ...d, quantity: e.target.value }))} className="input" />
                    </LabeledInput>
                    <LabeledInput label="Unit">
                      <input value={details.unit} onChange={(e) => setDetails((d) => ({ ...d, unit: e.target.value }))} className="input" />
                    </LabeledInput>
                    <LabeledInput label="Storage location">
                      <input value={details.storageLocation} onChange={(e) => setDetails((d) => ({ ...d, storageLocation: e.target.value }))} className="input" />
                    </LabeledInput>
                    <LabeledInput label="Temperature °C (optional)">
                      <input type="number" value={details.temperatureC} onChange={(e) => setDetails((d) => ({ ...d, temperatureC: e.target.value }))} className="input" />
                    </LabeledInput>
                    <LabeledInput label="Notes">
                      <input value={details.notes} onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))} className="input" />
                    </LabeledInput>
                  </div>
                  <style>{`.input { width: 100%; border-radius: 0.5rem; border: 1px solid #E1E7E1; background: #fff; padding: 0.55rem 0.8rem; font-size: 0.875rem; } .input:focus { outline: none; border-color: #146B4B; }`}</style>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={reset} disabled={saving}>
                    Start Over
                  </Button>
                  <Button className="flex-1" onClick={handleSave} disabled={saving} icon={ListChecks}>
                    {saving ? "Saving & Running Automation..." : "Save to Inventory & Run Automation"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function Stepper({ current }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i <= current ? "bg-primary text-white" : "bg-line text-ink-faint"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-xs font-medium ${i <= current ? "text-ink" : "text-ink-faint"}`}>{s}</span>
          {i < STEPS.length - 1 && <div className="h-px w-8 bg-line" />}
        </div>
      ))}
    </div>
  );
}

function LabeledInput({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function OutcomePanel({ outcome, onScanAnother, onViewInventory, onViewDonations }) {
  const { item, workflow, donation, ngoMatches } = outcome;
  return (
    <Card className="mt-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-light text-primary-dark">
        <CheckCircle2 size={24} />
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-ink">{item.name} added to inventory</h3>
      <p className="mt-1 text-sm text-ink-muted">
        Workflow selected: <span className="font-semibold text-ink">{workflowLabel(workflow)}</span>
      </p>

      {donation && (
        <div className="mt-5 rounded-xl2 border border-line bg-bg p-4 text-left">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <HeartHandshake size={16} className="text-primary" />
            Donation #{donation.donationCode} created automatically
          </p>
          {ngoMatches?.length > 0 && (
            <p className="mt-1.5 text-sm text-ink-muted">
              Best NGO match: <span className="font-medium text-ink">{ngoMatches[0].ngo.name}</span> —{" "}
              <span className="font-mono">{ngoMatches[0].matchScore}%</span> match
              {ngoMatches[0].distanceKm != null && `, ${ngoMatches[0].distanceKm} km away`}
            </p>
          )}
          <p className="mt-2 text-xs italic text-ink-faint">{donation.safetyDisclaimer}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={onScanAnother}>
          Scan Another Item
        </Button>
        <Button variant="secondary" onClick={onViewInventory}>
          View Inventory
        </Button>
        {donation && <Button onClick={onViewDonations}>View Donation</Button>}
      </div>
    </Card>
  );
}

function workflowLabel(workflow) {
  const map = {
    FRESH: "Keep in Inventory",
    NEAR_EXPIRY: "Near Expiry — Use Soon / Discount / Donate",
    DONATION_CANDIDATE: "Donation Candidate — NGO Matching Triggered",
    INSPECTION_REQUIRED: "Inspection Required — Human Review Needed",
  };
  return map[workflow] || workflow;
}

function guessCategory(foodName = "") {
  const n = foodName.toLowerCase();
  if (n.includes("milk") || n.includes("cheese") || n.includes("yogurt") || n.includes("dairy")) return "Dairy";
  if (n.includes("bread") || n.includes("croissant") || n.includes("bakery")) return "Bakery";
  if (n.includes("tomato") || n.includes("vegetable") || n.includes("fruit") || n.includes("banana") || n.includes("spinach")) return "Produce";
  if (n.includes("rice") || n.includes("grain")) return "Grains";
  if (n.includes("can")) return "Canned Food";
  if (n.includes("packaged") || n.includes("chip")) return "Packaged Food";
  return "Other";
}
