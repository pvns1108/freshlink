import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, UserPlus } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";

const ROLES = [
  { value: "household", label: "Household" },
  { value: "shop", label: "Shop / Restaurant" },
  { value: "ngo", label: "NGO" },
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "household", city: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      location: { city: form.city },
    });
    setSubmitting(false);
    if (res.success) navigate("/app");
    else setError(res.message);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white">
            <Leaf size={22} />
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-ink-muted">Start reducing food waste with FreshLink</p>
        </div>

        <div className="rounded-xl2 border border-line bg-surface p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
              <input required value={form.name} onChange={update("name")} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input type="email" required value={form.email} onChange={update("email")} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={update("password")} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Role</label>
              <select value={form.role} onChange={update("role")} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Location / City</label>
              <input value={form.city} onChange={update("city")} placeholder="e.g. Rivermill" className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            {error && <p className="text-sm text-critical">{error}</p>}
            <Button type="submit" className="w-full" icon={UserPlus} disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
