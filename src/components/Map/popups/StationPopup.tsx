import { FaLocationArrow } from "react-icons/fa";
import { FuelStation } from "@/services/stationService";

interface StationPopupProps {
  station: FuelStation;
}

export default function StationPopup({ station }: StationPopupProps) {
  return (
    <div className="min-w-[250px] p-3 bg-zinc-800 rounded-lg">
      {/* En-tête */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-500 to-blue-600 
                     border border-blue-500/10 flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 text-white"
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
          <h3 className="font-medium text-white text-sm">
            {station.brand || "Station service"}
          </h3>
          <p className="text-xs text-zinc-400">{station.address}</p>
          <p className="text-xs text-zinc-500">{station.city}</p>
        </div>
      </div>

      {/* Prix */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.entries(station.prices)
          .filter(([_, price]) => price !== null)
          .map(([fuel, price]) => (
            <div key={fuel} className="px-2 py-1.5 bg-zinc-700/50 rounded-lg">
              <span className="text-xs text-zinc-400">
                {fuel.toUpperCase()}
              </span>
              <span className="ml-1.5 text-xs font-medium text-green-400">
                {price?.toFixed(2)}€
              </span>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
        <span className="text-xs text-zinc-400">
          {new Date(station.lastUpdate).toLocaleDateString()}
        </span>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
                   rounded-lg text-xs font-medium transition-colors group"
        >
          <FaLocationArrow className="w-3 h-3 text-white" />
          <span className="text-white">Itinéraire</span>
        </a>
      </div>
    </div>
  );
}
