import { Link, useNavigate } from "react-router-dom";
import { Leaf, ScanLine, Gauge, HeartHandshake, ArrowRight, Sparkles } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";

const FEATURES = [
  {
    icon: ScanLine,
    title: "AI Food Screening",
    description: "Snap or upload a photo and get an indicative freshness read — condition, confidence, and any visible issues, in seconds.",
  },
  {
    icon: Gauge,
    title: "Smart Expiry Tracking",
    description: "OCR reads expiry dates straight off packaging, and a transparent priority engine scores urgency across your whole inventory.",
  },
  {
    icon: HeartHandshake,
    title: "Automated Donation Matching",
    description: "Donation-worthy surplus is automatically listed, matched to nearby NGOs, and tracked from pickup to completion.",
  },
];

const STEPS = ["Scan", "Analyze", "Prioritize", "Match", "Donate"];

export default function Landing() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const toast = useToast();

  const handleTryDemo = async () => {
    const res = await loginAsDemo("shop");
    if (res.success) {
      navigate("/app");
    } else {
      toast.error("Couldn't start the demo — is the backend running and seeded?");
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white">
            <Leaf size={18} strokeWidth={2.4} />
          </div>
          <span className="font-display text-lg font-semibold text-ink">FreshLink</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink-muted hover:text-ink">
            Log in
          </Link>
          <Button size="sm" onClick={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
          <Sparkles size={13} /> Hackathon MVP — AI-assisted, not a certified food-safety system
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Turn Food Waste Into Food Impact.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-ink-muted sm:text-lg">
          FreshLink uses AI-assisted food screening, expiry intelligence and automated NGO matching to help
          redirect surplus food before it becomes waste.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" icon={ArrowRight} onClick={handleTryDemo}>
            Try Demo
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl2 border border-line bg-surface p-6 shadow-card">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-primary-dark">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-xl2 border border-line bg-surface p-8 shadow-card">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-muted">How it works</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-full bg-primary-light px-4 py-2 text-sm font-semibold text-primary-dark">
                  {step.toUpperCase()}
                </div>
                {i < STEPS.length - 1 && <ArrowRight size={16} className="text-ink-faint" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-faint">
        FreshLink is a hackathon prototype. AI screening results are indicative only and do not certify food safety.
      </footer>
    </div>
  );
}
