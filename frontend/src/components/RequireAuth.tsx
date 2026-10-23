import React from "react";
import { Navigate } from "react-router-dom";

// Decode the JWT payload (no verification — the server does that) to check expiry.
function tokenIsValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp !== "number" || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function RequireAuth({ children }: { children?: React.ReactNode }) {
  if (!tokenIsValid(localStorage.getItem("token"))) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
