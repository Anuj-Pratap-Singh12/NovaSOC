import React, { useEffect, useState } from "react";
import socket from "../lib/socket";
import { API_URL, authHeaders } from "../config";

const MAX_ITEMS = 20;

export default function LiveFeed() {
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API_URL}/api/incidents`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        setFeed((data.incidents || []).slice(0, MAX_ITEMS));
      } catch (err) {
        console.error("LIVE FEED FETCH ERROR:", err);
      }
    }

    loadData();

    // Keep handler references so cleanup removes only THIS component's
    // listeners (socket.off("event") with no handler removes everyone's).
    const onNew = (inc: any) =>
      setFeed((prev) => [inc, ...prev].slice(0, MAX_ITEMS));
    const onUpdated = (inc: any) =>
      setFeed((prev) => prev.map((p) => (p._id === inc._id ? inc : p)));

    socket.on("new_incident", onNew);
    socket.on("incident_updated", onUpdated);

    return () => {
      socket.off("new_incident", onNew);
      socket.off("incident_updated", onUpdated);
    };
  }, []);

  return (
    <div className="bg-[#071a20] p-4 rounded-xl border border-cyan-700/20 max-h-64 overflow-auto">
      <h3 className="text-cyan-300 font-semibold mb-3">Live Threat Feed</h3>
      {feed.length === 0 && (
        <p className="text-sm text-gray-500">Waiting for incidents…</p>
      )}
      <ul className="space-y-3">
        {feed.map((item: any) => (
          <li key={item._id} className="p-3 bg-[#041826] rounded flex justify-between items-start">
            <div>
              <div className="font-semibold">
                {item.attack || item.rule?.name || "Alert"}
              </div>
              <div className="text-sm text-gray-400">
                {item.log?.src_ip ? `${item.log.src_ip} · ` : ""}
                {item.log?.payload ? String(item.log.payload).slice(0, 80) : "No payload"}
              </div>
            </div>
            <div className="text-sm text-gray-300">
              {new Date(item.createdAt).toLocaleTimeString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
