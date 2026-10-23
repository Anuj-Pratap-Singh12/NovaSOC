"use client";

import { useEffect, useState } from "react";
import TableCard from "./TableCard";
import { API_URL } from "../config";

export default function LogTable() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/logs`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .catch((err) => console.error("Failed to load logs", err));
  }, []);

  return (
    <TableCard title="Security Logs">
      <table className="w-full text-left text-gray-200">
        <thead>
          <tr className="text-cyan-400 border-b border-gray-700">
            <th className="py-2">Date</th>
            <th>Time</th>
            <th>Event</th>
            <th>Source IP</th>
            <th>Message</th>
            <th>Bytes</th>
            <th>User</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => {
            const ts = new Date(log.timestamp || log.createdAt);
            const date = ts.toLocaleDateString();
            const time = ts.toLocaleTimeString();

            return (
              <tr
                key={log._id}
                className="border-b border-gray-800 hover:bg-[#0f2335] transition"
              >
                <td className="py-3">{date}</td>
                <td>{time}</td>
                <td>{log.event_type}</td>
                <td>{log.src_ip || "-"}</td>
                <td>{log.payload || "-"}</td>
                <td>{log.bytes_sent}</td>
                <td>{log.username || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableCard>
  );
}
