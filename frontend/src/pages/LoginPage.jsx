import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const LOGIN_URL = `${API_URL}/api/auth/login`;

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (value) => {
    setPassword(value);
    if (value.length < 6) {
      setPasswordStrength("Weak");
    } else if (value.match(/[A-Z]/) && value.match(/[0-9]/)) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("Medium");
    }
  };

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passwordValid = passwordStrength !== "Weak" && password.length >= 6;
  const isValid = emailValid && passwordValid;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValid) return;

    setLoading(true);
    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || `Login failed (status ${res.status})`);
      } else {
        // Save token + user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // If admin → go to admin page, else dashboard
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Could not reach server. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">
      <div className="w-[400px] bg-[#0A0F1F] p-10 rounded-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,255,255,0.15)] text-center">
        <h2 className="text-3xl font-bold text-[#00E5FF] mb-6">Login</h2>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/40 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="relative mb-6">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-12 text-[15px] bg-[#101B2E] border border-cyan-300/30 rounded-md 
                         focus:border-[#00E5FF] focus:shadow-[0_0_10px_rgba(0,231,255,0.5)] 
                         outline-none text-white peer"
            />
            <label className="absolute left-12 top-1/2 -translate-y-1/2 text-sm text-[#7FE9FF] 
                              pointer-events-none transition-all peer-focus:top-[-6px] 
                              peer-focus:left-3 peer-focus:text-xs peer-focus:bg-[#0A0F1F]
                              peer-not-placeholder-shown:top-[-6px] peer-not-placeholder-shown:left-3 
                              peer-not-placeholder-shown:text-xs">
              Email
            </label>
            {!emailValid && email.length > 0 && (
              <p className="text-red-400 text-xs text-left mt-1">
                Invalid email format
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative mb-3">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              className="w-full h-12 px-12 text-[15px] bg-[#101B2E] border border-cyan-300/30 rounded-md
                         focus:border-[#00E5FF] focus:shadow-[0_0_10px_rgba(0,231,255,0.5)]
                         outline-none text-white peer"
            />
            <label className="absolute left-12 top-1/2 -translate-y-1/2 text-sm text-[#7FE9FF]
                              pointer-events-none transition-all peer-focus:top-[-6px]
                              peer-focus:left-3 peer-focus:text-xs peer-focus:bg-[#0A0F1F]
                              peer-not-placeholder-shown:top-[-6px] peer-not-placeholder-shown:left-3
                              peer-not-placeholder-shown:text-xs">
              Password
            </label>
          </div>

          {/* Strength indicator */}
          {password && (
            <p
              className={`text-xs text-left mt-[-4px] mb-2 ${
                passwordStrength === "Weak"
                  ? "text-red-500"
                  : passwordStrength === "Medium"
                  ? "text-yellow-300"
                  : "text-green-400"
              }`}
            >
              Strength: {passwordStrength}
            </p>
          )}

          {/* Remember Me + Forgot Password */}
          <div className="flex justify-between items-center mb-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="scale-110 accent-cyan-400" />
              Remember Me
            </label>

            <Link
              to="/forgot-password"
              className="text-[#00E7FF] hover:text-cyan-300"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Btn */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full h-12 rounded-lg text-lg font-semibold bg-[#0077FF]
                       hover:bg-[#62b5e5] transition shadow-[0_0_12px_#00E5FF]
                       disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
