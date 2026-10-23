// Single place for the backend address. Override at build/start time with
// REACT_APP_API_URL=http://your-host:4000 (CRA only exposes REACT_APP_* vars).
export const API_URL: string =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
