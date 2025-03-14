import { FaGasPump, FaLocationArrow } from "react-icons/fa";
import { FuelStation } from "../types";
import { LastUpdateDisplay } from "../LastUpdateDisplay";
import { formatLastUpdate } from "../utils";

interface StationCardProps {
  station: FuelStation;
  selectedFuel: string;
  getFuelPrice: (station: FuelStation, fuel: string) => number | null;
  formatPrice: (price: number | null | undefined) => string;
}

export function StationCard({
  station,
  selectedFuel,
  getFuelPrice,
  formatPrice,
}: StationCardProps) {
  const updateInfo = formatLastUpdate(station.lastUpdate);

  return (
    <div className="group relative p-3 sm:p-4 bg-zinc-800 rounded-xl hover:bg-zinc-750 transition-colors duration-200">
      {/* En-tête de la station */}
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className="flex gap-2 sm:gap-3">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 
                         border border-blue-500/10 flex items-center justify-center group"
          >
            <FaGasPump
              className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-blue-300 
                                transition-colors duration-200"
            />
          </div>
          <div className="max-w-[60%]">
            <h3 className="font-medium text-white text-sm sm:text-base">
              {station.brand || station.name}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2">
              {station.address}
            </p>
          </div>
        </div>

        {/* Prix principal */}
        <div className="flex flex-col items-end ml-2 sm:ml-4">
          <div className="px-2 sm:px-3 py-1 bg-green-600/20 rounded-lg">
            <span className="text-sm sm:text-base text-green-400 font-semibold whitespace-nowrap">
              {formatPrice(getFuelPrice(station, selectedFuel))}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-500 mt-1">
            {selectedFuel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Grille des prix */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        {Object.entries(station.prices)
          .filter(([_, price]) => price !== null)
          .map(([fuel, price]) => (
            <div
              key={fuel}
              className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded bg-zinc-700/50
                       ${fuel === selectedFuel ? "ring-1 ring-blue-500" : ""}`}
            >
              <div className="text-[10px] sm:text-xs text-zinc-400">
                {fuel.toUpperCase()}
              </div>
              <div className="text-xs sm:text-sm font-medium text-white">
                {formatPrice(price)}
              </div>
              {price && (
                <div className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">
                  {price ? `${(price * 50).toFixed(2)} € /50L` : "-"}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-zinc-700/50">
        <LastUpdateDisplay {...updateInfo} />
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`,
              "_blank"
            )
          }
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 
                   rounded-lg text-white text-sm sm:text-base font-medium transition-colors"
        >
          <FaLocationArrow className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Itinéraire</span>
        </button>
      </div>
    </div>
  );
}
