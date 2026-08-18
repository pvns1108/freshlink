import { createContext, useCallback, useEffect, useState } from "react";
import api from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("freshlink_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem("freshlink_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("freshlink_token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  const register = async (payload) => {
    setAuthError(null);
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("freshlink_token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("freshlink_token");
    setUser(null);
  };

  const loginAsDemo = async (role) => {
    const demoCreds = {
      admin: { email: "admin@freshlink.demo", password: "admin123" },
      shop: { email: "shop@freshlink.demo", password: "shop123" },
      ngo: { email: "ngo@freshlink.demo", password: "ngo123" },
      household: { email: "user@freshlink.demo", password: "user123" },
    };
    const creds = demoCreds[role];
    if (!creds) return { success: false, message: "Unknown demo role." };
    return login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, authError, login, register, logout, loginAsDemo, refresh: loadMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}
