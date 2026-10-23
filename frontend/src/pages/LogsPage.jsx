// src/pages/LogsPage.jsx

import { useState, useEffect } from "react";
import { API_URL } from "../config";

const severityColor = {
  High: "bg-red-500/20 text-red-400 border-red-500/40",
  Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
  Low: "bg-green-500/20 text-green-400 border-green-500/40",
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/logs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to load logs from server");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#000814] min-h-screen text-white p-6 md:p-8 flex items-center justify-center">
        <p className="text-cyan-400">Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#000814] min-h-screen text-white p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
          🔍 Log Monitoring
        </h1>
        <div className="bg-red-500/20 border border-red-500/40 p-4 rounded text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#000814] min-h-screen text-white p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
        🔍 Log Monitoring
      </h1>
      <p className="text-sm text-slate-400 mb-6">
        Real-time security event visibility across your SOC environment.
      </p>

      {logs.length === 0 ? (
        <div className="bg-[#0A1320] p-6 rounded-lg border border-cyan-500/20 text-center">
          <p className="text-slate-400">No logs available</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-cyan-500/20 bg-[#0A1320]">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-[#0C1C2E] text-cyan-300">
              <tr>
                <th className="p-3 text-left">Timestamp</th>
                <th className="p-3 text-left">Source</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Source IP</th>
                <th className="p-3 text-left">Target</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Severity</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr
                  key={log._id}
                  className="border-t border-cyan-500/10 hover:bg-[#112233] transition"
                >
                  <td className="p-3 whitespace-nowrap text-slate-200">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 text-slate-200">{log.source || "System"}</td>
                  <td className="p-3 text-slate-200">{log.category || "N/A"}</td>
                  <td className="p-3 text-slate-200">{log.sourceIP || "-"}</td>
                  <td className="p-3 text-slate-200">{log.target || "N/A"}</td>
                  <td className="p-3 text-slate-300">{log.message || "No message"}</td>
                  <td className="p-3 text-slate-200">{log.action || "Logged"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                        severityColor[log.severity] || severityColor["Low"]
                      }`}
                    >
                      {log.severity || "Low"}
                    </span>
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
