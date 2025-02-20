import { FaBolt, FaLocationArrow, FaPlug } from "react-icons/fa";
import { ChargingStation } from "../types";
import { formatLastUpdate } from "../utils";
import { LastUpdateDisplay } from "../LastUpdateDisplay";

interface ChargingStationCardProps {
  station: ChargingStation;
}

export function ChargingStationCard({ station }: ChargingStationCardProps) {
  const updateInfo = formatLastUpdate(station.lastUpdate);

  return (
    <div className="p-4 bg-zinc-800 rounded-xl hover:bg-zinc-750">
      {/* En-tête */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
          <FaBolt className="w-6 h-6 text-green-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-white">{station.name}</h3>
              <p className="text-sm text-zinc-400">{station.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="px-2 py-1 bg-zinc-700/50 rounded-lg">
          <span className="text-xs text-zinc-400">Puissance</span>
          <span className="ml-2 text-sm font-medium text-green-400">
            {station.power} kW
          </span>
        </div>
        <div className="px-2 py-1 bg-zinc-700/50 rounded-lg">
          <span className="text-xs text-zinc-400">Points</span>
          <span className="ml-2 text-sm font-medium text-white">
            {station.chargingPoints}
          </span>
        </div>
        {station.connectorTypes.map((type, index) => (
          <div key={index} className="px-2 py-1 bg-zinc-700/50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <FaPlug className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-white">{type}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
        <LastUpdateDisplay {...updateInfo} />
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 
                    rounded-lg text-white text-sm font-medium transition-colors"
        >
          <FaLocationArrow className="w-3.5 h-3.5" />
          <span>Itinéraire</span>
        </a>
      </div>
    </div>
  );
}
