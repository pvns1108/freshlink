import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, LogIn } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";

const DEMO_ROLES = [
  { role: "admin", label: "Admin", email: "admin@freshlink.demo" },
  { role: "shop", label: "Shop", email: "shop@freshlink.demo" },
  { role: "ngo", label: "NGO", email: "ngo@freshlink.demo" },
  { role: "household", label: "Household", email: "user@freshlink.demo" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) navigate("/app");
    else setError(res.message);
  };

  const handleDemo = async (role) => {
    setSubmitting(true);
    setError(null);
    const res = await loginAsDemo(role);
    setSubmitting(false);
    if (res.success) navigate("/app");
    else setError(res.message);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white">
            <Leaf size={22} />
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-muted">Log in to your FreshLink account</p>
        </div>

        <div className="rounded-xl2 border border-line bg-surface p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-critical">{error}</p>}
            <Button type="submit" className="w-full" icon={LogIn} disabled={submitting}>
              {submitting ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-faint">or use a demo account</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ROLES.map((d) => (
              <button
                key={d.role}
                onClick={() => handleDemo(d.role)}
                disabled={submitting}
                className="rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink hover:border-primary hover:bg-primary-light disabled:opacity-50"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
