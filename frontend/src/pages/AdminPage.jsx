import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

const ANALYSTS_URL = `${API_URL}/api/analysts`;

const AdminPage = () => {
  const [analysts, setAnalysts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 📌 Fetch analysts from backend
  const fetchAnalysts = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authorized. Please log in as admin.");
        return;
      }

      const res = await fetch(ANALYSTS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error fetching analysts");
      }

      setAnalysts(data);
    } catch (err) {
      console.error(err);
      setError("Could not load analysts from server.");
    }
  };

  // Load analysts on first render
  useEffect(() => {
    fetchAnalysts();
  }, []);

  // 📌 Add Analyst (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, location } = form;
    if (!name || !email || !password || !location) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authorized. Please log in.");
        setLoading(false);
        return;
      }

      const res = await fetch(ANALYSTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Failed to add analyst.");
      } else {
        setForm({ name: "", email: "", password: "", location: "" });
        await fetchAnalysts(); // reload list
      }
    } catch (err) {
      console.error(err);
      setError("Server error while adding analyst.");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Delete Analyst (DELETE)
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this analyst?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authorized. Please log in.");
        return;
      }

      const res = await fetch(`${ANALYSTS_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Failed to delete analyst.");
      } else {
        setAnalysts((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      console.error(err);
      setError("Server error while deleting analyst.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 lg:p-10">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">
        Admin Panel – Analyst Management
      </h1>

      {/* Register New Analyst */}
      <div className="bg-[#050B16] border border-cyan-500/30 rounded-xl p-5 mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Register New Analyst</h2>

        {error && (
          <div className="mb-3 text-sm text-red-400 bg-red-900/30 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 items-end"
        >
          <div>
            <label className="block text-sm mb-1 text-slate-300">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2
                         focus:outline-none focus:border-cyan-400"
              placeholder="Analyst name"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2
                         focus:outline-none focus:border-cyan-400"
              placeholder="analyst@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2
                         focus:outline-none focus:border-cyan-400"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2
                         focus:outline-none focus:border-cyan-400"
              placeholder="City, Country"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 md:mt-0 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 
                       font-semibold text-sm md:text-base md:col-span-2 xl:col-span-1 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Analyst"}
          </button>
        </form>
      </div>

      {/* Analysts List */}
      <div className="bg-[#050B16] border border-slate-700 rounded-xl p-5 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Analyst Users</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Role</th>
                <th className="py-2 px-3 text-left">Location</th>
                <th className="py-2 px-3 text-left">Created</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {analysts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-slate-400">
                    No analysts found.
                  </td>
                </tr>
              ) : (
                analysts.map((a) => (
                  <tr
                    key={a._id}
                    className="border-b border-slate-800 hover:bg-slate-900/60"
                  >
                    <td className="py-2 px-3">{a.name}</td>
                    <td className="py-2 px-3">{a.email}</td>
                    <td className="py-2 px-3 capitalize">{a.role || "analyst"}</td>
                    <td className="py-2 px-3">{a.location}</td>
                    <td className="py-2 px-3">
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="px-3 py-1 rounded-lg bg-red-500/80 hover:bg-red-400 
                                   text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
