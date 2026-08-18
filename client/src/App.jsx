import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ScanFood from "./pages/ScanFood.jsx";
import Inventory from "./pages/Inventory.jsx";
import Donations from "./pages/Donations.jsx";
import NGOs from "./pages/NGOs.jsx";
import AutomationCenter from "./pages/AutomationCenter.jsx";
import AIInsights from "./pages/AIInsights.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/scan" element={<ScanFood />} />
          <Route path="/app/inventory" element={<Inventory />} />
          <Route path="/app/donations" element={<Donations />} />
          <Route path="/app/ngos" element={<NGOs />} />
          <Route path="/app/automation" element={<AutomationCenter />} />
          <Route path="/app/insights" element={<AIInsights />} />
          <Route path="/app/notifications" element={<Notifications />} />
          <Route path="/app/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}
