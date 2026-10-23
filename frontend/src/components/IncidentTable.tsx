"use client";
import { useEffect, useMemo, useState } from "react";
import TableCard from "./TableCard";
import SeverityBadge from "./SeverityBadge";
import IncidentFilters from "./IncidentFilters";
import IncidentModal from "./IncidentModal";
import socket from "../lib/socket";
import { API_URL } from "../config";

export default function IncidentTable() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    severity: "",
    rule: "",
  });
  const [selected, setSelected] = useState<any | null>(null);

  // Extract rule names
  const rulesList = useMemo(
    () => Array.from(new Set(incidents.map(i => i.rule?.name).filter(Boolean))),
    [incidents]
  );

  // Load incidents on startup
  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/api/incidents`);
      const data = await res.json();
      setIncidents(data.incidents || []);
    }
    load();
  }, []);

  // Websocket listeners
  useEffect(() => {
    socket.on("new_incident", (inc: any) => {
      setIncidents(prev => [inc, ...prev]);
    });

    socket.on("incident_updated", (updated: any) =>
      setIncidents(prev =>
        prev.map(i => (i._id === updated._id ? updated : i))
      )
    );

    socket.on("ip_blocked", (record: any) =>
      setIncidents(prev =>
        prev.map(i =>
          i.log?.src_ip === record.ip ? { ...i, isBlocked: true } : i
        )
      )
    );

    socket.on("ip_unblocked", ({ ip }) =>
      setIncidents(prev =>
        prev.map(i =>
          i.log?.src_ip === ip ? { ...i, isBlocked: false } : i
        )
      )
    );

    return () => {
      socket.off("new_incident");
      socket.off("incident_updated");
      socket.off("ip_blocked");
      socket.off("ip_unblocked");
    };
  }, []);

  // Filtering logic
  const filtered = incidents.filter(inc => {
    if (filters.severity && inc.severity !== filters.severity) return false;
    if (filters.rule && inc.rule?.name !== filters.rule) return false;

    if (filters.search) {
      const s = filters.search.toLowerCase();
      const haystack = JSON.stringify(inc).toLowerCase();
      if (!haystack.includes(s)) return false;
    }
    return true;
  });

  // Change incident status
  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`${API_URL}/api/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    if (data.success) {
      setIncidents(prev =>
        prev.map(i => (i._id === id ? data.incident : i))
      );
    }
  }

  // Save updates from modal
  async function saveIncidentUpdates(updates: any) {
    if (!selected) return;

    const res = await fetch(
      `${API_URL}/api/incidents/${selected._id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );
    const data = await res.json();
    if (data.success) setSelected(data.incident);
  }

  // Block / Unblock
  async function toggleBlock(ip: string, isBlocked: boolean) {
    if (!ip) return;

    if (!isBlocked) {
      alert("⚠ Only auto-block is allowed. Analyst cannot manually block.");
      return;
    }

    // Unblock
    const res = await fetch(
      `${API_URL}/api/blocklist/unblock/${ip}`,
      { method: "POST" }
    );
    const data = await res.json();

    if (data.success) {
      setIncidents(prev =>
        prev.map(i =>
          i.log?.src_ip === ip ? { ...i, isBlocked: false } : i
        )
      );
    }
  }

  // Convert VPN score to Yes/No
  function vpnStatus(score: number) {
    return score >= 60 ? "Yes" : "No";
  }

  return (
    <TableCard>
      <IncidentFilters
        filters={filters}
        setFilters={setFilters}
        rules={rulesList}
      />

      <table className="w-full text-left text-gray-200">
        <thead>
          <tr className="text-cyan-400 border-b border-gray-700">
            <th className="py-2">ID</th>
            <th>Attack</th>
            <th>Severity</th>
            <th>Source IP</th>

            {/* ⭐ NEW COLUMN: VPN STATUS */}
            <th>VPN</th>

            <th>Status</th>
            <th>Block</th>
            <th>Target</th>
            <th>Rule</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((inc, idx) => (
            <tr
              key={inc._id}
              className="border-b border-gray-800 hover:bg-[#0f2335]"
            >
              <td className="py-3">{idx + 1}</td>

              <td onClick={() => setSelected(inc)} className="cursor-pointer">
                {inc.attack || inc.rule?.name}
              </td>

              <td>
                <SeverityBadge level={inc.severity} />
              </td>

              <td>{inc.log?.src_ip || "-"}</td>

              {/* ⭐ VPN Yes/No */}
              <td className="font-semibold">
                {vpnStatus(inc.vpn_score)}
              </td>

              {/* Status Dropdown */}
              <td>
                <select
                  className="bg-gray-800 text-white px-2 py-1 rounded"
                  value={inc.status}
                  onChange={(e) => updateStatus(inc._id, e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </td>

              {/* Block / Unblock */}
              <td>
                <button
                  className={`px-3 py-1 rounded text-xs ${
                    inc.isBlocked ? "bg-red-600" : "bg-green-700"
                  }`}
                  onClick={() => toggleBlock(inc.log?.src_ip, inc.isBlocked)}
                >
                  {inc.isBlocked ? "Unblock" : "Blocked?"}
                </button>
              </td>

              <td>{inc.target}</td>
              <td>{inc.rule?.name}</td>

              <td>{new Date(inc.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <IncidentModal
        incident={selected}
        onClose={() => setSelected(null)}
        onSave={saveIncidentUpdates}
      />
    </TableCard>
  );
}
