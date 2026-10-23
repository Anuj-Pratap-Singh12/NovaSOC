import { useNavigate } from "react-router-dom";

export default function MapButton() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0d1117] p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
      <h2 className="text-lg text-white mb-3">Threat Map</h2>
      <button
        onClick={() => navigate("/threat-map")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-white"
      >
        View Threats on Map →
      </button>
    </div>
  );
}
