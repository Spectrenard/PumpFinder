import { ChargingStation } from "@/services/chargingStationService";
import { FaBolt, FaPlug, FaCreditCard, FaLocationArrow } from "react-icons/fa";

interface ChargingStationPopupProps {
  station: ChargingStation;
}

export default function ChargingStationPopup({
  station,
}: ChargingStationPopupProps) {
  return (
    <div className="min-w-[250px] p-3 bg-zinc-900 text-white rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-lg bg-gradient-to-tr from-green-500 to-green-600 
                       border border-green-500/10 flex items-center justify-center"
        >
          <FaBolt className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-white text-sm">{station.name}</h3>
          <p className="text-xs text-zinc-400">{station.address}</p>
          <p className="text-xs text-zinc-500">{station.city}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="px-2 py-1.5 bg-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-400">Puissance</div>
          <div className="text-sm font-medium text-white">
            {station.power} kW
          </div>
        </div>
        <div className="px-2 py-1.5 bg-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-400">Points</div>
          <div className="text-sm font-medium text-white">
            {station.chargingPoints}
          </div>
        </div>
      </div>

      {station.connectorTypes.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-zinc-400 mb-1">Types de prises</div>
          <div className="flex flex-wrap gap-1.5">
            {station.connectorTypes.map((type, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded-lg"
              >
                <FaPlug className="w-2.5 h-2.5 text-zinc-400" />
                <span className="text-xs text-white">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5 mb-3">
        <div className="px-2 py-1.5 bg-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-400">Opérateur</div>
          <div className="text-xs text-white">{station.operator}</div>
        </div>
        <div className="px-2 py-1.5 bg-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-400">Horaires</div>
          <div className="text-xs text-white">{station.schedule}</div>
        </div>
        {station.observations && (
          <div className="px-2 py-1.5 bg-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-400">Notes</div>
            <div className="text-xs text-white">{station.observations}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
        <span className="text-xs text-zinc-400">
          {new Date(station.lastUpdate).toLocaleDateString()}
        </span>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 
                   rounded-lg text-xs font-medium transition-colors group"
        >
          <FaLocationArrow className="w-3 h-3 text-white" />
          <span className="text-white">Itinéraire</span>
        </a>
      </div>
    </div>
  );
}
