import React from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Tooltip,
  Marker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const attacks = [
  {
    id: 1,
    severity: "high",
    type: "Ransomware Attack",
    from: { lat: 40.7128, lng: -74.006, name: "New York, USA" },
    to: { lat: 28.6139, lng: 77.209, name: "New Delhi, India" },
  },
  {
    id: 2,
    severity: "medium",
    type: "Bruteforce Attempt",
    from: { lat: 51.5074, lng: -0.1278, name: "London, UK" },
    to: { lat: 52.52,  lng: 13.405, name: "Berlin, Germany" },
  },
  {
    id: 3,
    severity: "low",
    type: "Reconnaissance Scan",
    from: { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" },
    to: { lat: 37.5665, lng: 126.978,  name: "Seoul, S. Korea" },
  },
];

const severityColor = {
  high: "#ff2d2d",
  medium: "#ffd500",
  low: "#00ff7f",
};

// Custom pulsing attacker marker
const PulseIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div class="pulse-marker" style="color:${color};"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

// Custom flashing target marker
const FlashIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div class="impact" style="background:${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

export default function ThreatMapPage() {
  return (
    <div className="flex bg-[#000814] min-h-screen text-cyan-100">
      {/* 🔥 Animated marker styles */}
      <style>{`
        .pulse-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          position: relative;
        }
        .pulse-marker::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid currentColor;
          animation: pulse 1.3s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .impact {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: flash 1s infinite alternate;
        }
        @keyframes flash {
          0% { box-shadow: 0 0 6px currentColor; opacity: .6; }
          100% { box-shadow: 0 0 16px currentColor; opacity: 1; }
        }
        .leaflet-control-attribution {
          background: rgba(0, 8, 20, 0.7) !important;
          color: #7dd3fc !important;
        }
        .leaflet-control-attribution a { color: #7dd3fc !important; }
      `}</style>

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-cyan-400 mb-5">
          🌍 Global Threat Map
        </h1>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
          {/* 🌐 Map Section */}
          <div className="rounded-xl border border-cyan-500/40 overflow-hidden shadow-lg shadow-cyan-500/10 bg-[#07111E]">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom={true}
              className="w-full h-[500px]"
            >
              {/* ⭐ Dark Theme Tiles */}
              <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {attacks.map((a) => {
                const color = severityColor[a.severity];
                return (
                  <React.Fragment key={a.id}>
                    {/* 🔻 Dashed Attack Path */}
                    <Polyline
                      pathOptions={{
                        color,
                        dashArray: "6, 6",
                        weight: 1.5,
                        opacity: 0.9,
                      }}
                      positions={[
                        [a.from.lat, a.from.lng],
                        [a.to.lat, a.to.lng],
                      ]}
                    />

                    {/* 🔴 Pulsing Source */}
                    <Marker
                      position={[a.from.lat, a.from.lng]}
                      icon={PulseIcon(color)}
                    >
                      <Tooltip>
                        <strong>Source:</strong> {a.from.name}
                        <br />
                        {a.type}
                      </Tooltip>
                    </Marker>

                    {/* 💥 Flash Impact Destination */}
                    <Marker
                      position={[a.to.lat, a.to.lng]}
                      icon={FlashIcon(color)}
                    >
                      <Tooltip>
                        <strong>Target:</strong> {a.to.name}
                        <br />
                        Severity: {a.severity.toUpperCase()}
                      </Tooltip>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          {/* 📡 Live Attack Feed */}
          <div className="bg-[#050B16] border border-cyan-500/30 rounded-xl p-4 shadow-md overflow-y-auto">
            <h2 className="text-lg font-semibold text-cyan-300 mb-3">
              Live Attack Feed
            </h2>

            {attacks.map((a) => (
              <div
                key={a.id}
                className="p-3 mb-3 rounded-md border border-cyan-500/30 bg-[#07111E] 
                           hover:bg-cyan-500/10 transition"
              >
                <div className="flex justify-between">
                  <p className="font-medium">{a.type}</p>
                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: severityColor[a.severity] }}
                  >
                    {a.severity}
                  </span>
                </div>
                <p className="text-xs text-cyan-200 mt-1">
                  {a.from.name} → {a.to.name}
                </p>
              </div>
            ))}

            <p className="text-[10px] text-cyan-200/50 mt-2 border-t border-cyan-400/20 pt-2">
              *Demo data — next: add real logs via Geo-IP!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
