import axios from "axios";
export const API_URL = "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});
