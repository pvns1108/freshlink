import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("freshlink_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normalize error messages so components can show something useful
    // even for network failures or 503s from a disconnected database.
    const message =
      err.response?.data?.message ||
      (err.code === "ERR_NETWORK"
        ? "Can't reach the FreshLink server. Is the backend running?"
        : "Something went wrong. Please try again.");
    return Promise.reject({ ...err, message });
  }
);

export default api;
