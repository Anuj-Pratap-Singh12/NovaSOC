// src/pages/IncidentsPage.jsx

import { useState, useEffect } from "react";
import { API_URL } from "../config";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    severity: "",
  });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/incidents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch incidents");
        }

        const data = await response.json();
        setIncidents(data.incidents || []);
      } catch (err) {
        console.error("Error fetching incidents:", err);
        setError("Failed to load incidents from server");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Filtering logic
  const filtered = incidents.filter((inc) => {
    if (filters.severity && inc.severity !== filters.severity) return false;

    if (filters.search) {
      const s = filters.search.toLowerCase();
      const haystack = JSON.stringify(inc).toLowerCase();
      if (!haystack.includes(s)) return false;
    }
    return true;
  });

  // Update incident status
  async function updateStatus(id, newStatus) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/incidents/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    if (data.success) {
      setIncidents((prev) =>
        prev.map((i) => (i._id === id ? data.incident : i))
      );
    }
  }

  // VPN score to Yes/No
  function vpnStatus(score) {
    return score >= 60 ? "Yes" : "No";
  }

  if (loading) {
    return (
      <div className="bg-[#000814] min-h-screen text-white p-6 md:p-8 flex items-center justify-center">
        <p className="text-cyan-400">Loading incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#000814] min-h-screen text-white p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">
          🛡 Incident Response
        </h1>
        <div className="bg-red-500/20 border border-red-500/40 p-4 rounded text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#000814] min-h-screen text-white p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-6">
        🛡 Incident Response
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search incidents..."
          className="px-4 py-2 bg-[#0A1320] border border-cyan-500/20 rounded text-white placeholder-gray-500"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="px-4 py-2 bg-[#0A1320] border border-cyan-500/20 rounded text-white"
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
        >
          <option value="">All Severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#0A1320] p-6 rounded-lg border border-cyan-500/20 text-center">
          <p className="text-slate-400">No incidents available</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full bg-[#0A1320] border border-cyan-500/20 text-sm">
            <thead className="bg-[#0C1C2E] text-cyan-300">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Attack</th>
                <th className="p-3 text-left">Severity</th>
                <th className="p-3 text-left">Source IP</th>
                <th className="p-3 text-left">VPN</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Target</th>
                <th className="p-3 text-left">Rule</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((incident, idx) => (
                <tr
                  key={incident._id}
                  className="border-b border-cyan-500/10 hover:bg-[#112233] transition"
                >
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-semibold text-cyan-300">
                    {incident.attack || incident.rule?.name || "N/A"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        incident.severity === "High"
                          ? "bg-red-500/20 text-red-300"
                          : incident.severity === "Medium"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {incident.severity || "Low"}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-sm">
                    {incident.log?.src_ip || "-"}
                  </td>
                  <td className="p-3 font-semibold">
                    {vpnStatus(incident.vpn_score || 0)}
                  </td>
                  <td className="p-3">
                    <select
                      className="bg-[#1a2a3a] border border-cyan-500/30 text-white px-2 py-1 rounded text-xs"
                      value={incident.status || "Open"}
                      onChange={(e) =>
                        updateStatus(incident._id, e.target.value)
                      }
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="p-3">{incident.target || "Web Server"}</td>
                  <td className="p-3">{incident.rule?.name || "N/A"}</td>
                  <td className="p-3 text-xs">
                    {new Date(incident.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
