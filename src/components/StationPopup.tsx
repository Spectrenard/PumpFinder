import { FaLocationArrow } from "react-icons/fa";
import { FuelStation } from "@/services/stationService";

interface StationPopupProps {
  station: FuelStation;
}

export default function StationPopup({ station }: StationPopupProps) {
  return (
    <div
      className="min-w-[280px] p-4 bg-zinc-800 hover:bg-zinc-900 
                    rounded-xl transition-all duration-200"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl bg-zinc-700/50 
                          flex items-center justify-center"
          >
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-4 4h-4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-zinc-100">
              {station.brand || "Station service"}
            </h3>
            <p className="text-sm text-zinc-400">{station.address}</p>
          </div>
        </div>
      </div>

      {/* Prix */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(station.prices)
          .filter(([_, price]) => price !== null)
          .map(([fuel, price]) => (
            <div key={fuel} className="px-3 py-1.5 bg-zinc-700/50 rounded-lg">
              <span className="text-sm text-zinc-400">
                {fuel.toUpperCase()}
              </span>
              <span className="ml-2 text-sm font-medium text-green-400">
                {price?.toFixed(2)}€
              </span>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-zinc-400 mt-2">
        <span>
          Mis à jour le {new Date(station.lastUpdate).toLocaleDateString()}
        </span>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500
                         hover:from-blue-500 hover:to-blue-400 rounded-lg text-white font-medium 
                     transition-colors"
        >
          <FaLocationArrow className="w-3.5 h-3.5 text-white" />
          <span className="text-white">Itinéraire</span>
        </a>
      </div>
    </div>
  );
}
