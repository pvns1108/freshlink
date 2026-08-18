import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import Button from "../components/ui/Button.jsx";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-light text-primary-dark">
          <Leaf size={22} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">404</h1>
        <p className="mt-2 text-sm text-ink-muted">This page doesn't exist.</p>
        <Link to="/">
          <Button className="mt-6">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
