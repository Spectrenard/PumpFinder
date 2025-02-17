import { useState } from "react";
import {
  FaGasPump,
  FaLocationArrow,
  FaClock,
  FaChevronDown,
} from "react-icons/fa";

interface FuelStation {
  id: string;
  brand: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  prices: {
    gazole?: number | null;
    sp95?: number | null;
    sp98?: number | null;
    e85?: number | null;
    gplc?: number | null;
  };
  services?: string[];
  lastUpdate: string;
}

interface SidebarProps {
  stations: FuelStation[];
  selectedFuel: string;
  onFuelChange: (fuel: string) => void;
  onSortChange: (sort: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  stations = [],
  selectedFuel,
  onFuelChange,
  onSortChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const [sortBy, setSortBy] = useState("price");

  const formatPrice = (price: number | null | undefined) => {
    return price ? `${price.toFixed(2)} €/L` : "Non disponible";
  };

  const getStationServices = (station: FuelStation) => {
    const services = [];
    if (station.services) {
      if (station.services.includes("24/24")) {
        services.push({ label: "24h/24", icon: <FaClock /> });
      }
    }
    return services;
  };

  const getFuelPrice = (station: FuelStation, fuel: string) => {
    const fuelMapping: { [key: string]: keyof FuelStation["prices"] } = {
      sp95: "sp95",
      sp98: "sp98",
      gazole: "gazole",
      e85: "e85",
      gplc: "gplc",
    };

    const fuelKey = fuelMapping[fuel];
    return fuelKey ? station.prices[fuelKey] : null;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-[85vw] md:w-96 max-w-[400px] md:max-w-none bg-black backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-full glass-effect rounded-2xl overflow-hidden">
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-400">
                Stations à proximité ({stations.length})
              </h2>
              <button
                onClick={onClose}
                className="md:hidden p-2 text-white/60 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <select
                  value={selectedFuel}
                  onChange={(e) => onFuelChange(e.target.value)}
                  className="w-full appearance-none px-4 py-2 pr-10 rounded-xl bg-white/5 border border-white/10 
                             text-white hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  <option value="all">Tous les carburants</option>
                  <option value="sp95">SP95</option>
                  <option value="sp98">SP98</option>
                  <option value="gazole">Gazole</option>
                  <option value="e85">E85</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="space-y-4">
                {stations && stations.length > 0 ? (
                  stations.map((station) => (
                    <div
                      key={station.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="mt-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <FaGasPump className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                              {station.brand || station.name}
                            </h3>
                            <p className="text-sm text-white/60 break-words">
                              {station.address}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 font-semibold mb-1">
                            {formatPrice(getFuelPrice(station, selectedFuel))}
                          </div>
                          <p className="text-sm text-white/60">
                            {selectedFuel === "gazole"
                              ? "DIESEL"
                              : selectedFuel.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {Object.entries(station.prices).map(
                          ([fuel, price]) =>
                            price && (
                              <div
                                key={fuel}
                                className={`text-sm ${
                                  fuel === selectedFuel
                                    ? "text-green-400"
                                    : "text-white/60"
                                }`}
                              >
                                {fuel.toUpperCase()}: {formatPrice(price)}
                              </div>
                            )
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">
                            Mis à jour:{" "}
                            {new Date(station.lastUpdate).toLocaleDateString()}
                          </span>
                          <button
                            className="px-4 py-2 bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
                            onClick={() => {
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`,
                                "_blank"
                              );
                            }}
                          >
                            Itinéraire →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white/60 py-4">
                    Aucune station trouvée
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
