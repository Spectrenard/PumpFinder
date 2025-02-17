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
  const [sortBy, setSortBy] = useState<string | null>(null);

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
      {/* Overlay amélioré */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 
                     transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar repensée */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-[85vw] md:w-96 
                   bg-zinc-900 border-r border-zinc-800
                   z-50 transform transition-all duration-300 
                   ${
                     isOpen
                       ? "translate-x-0"
                       : "-translate-x-full md:translate-x-0"
                   }`}
      >
        <div className="h-full flex flex-col">
          {/* Header de la Sidebar */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Stations à proximité
                {stations?.length > 0 && (
                  <span className="ml-2 text-sm text-zinc-400">
                    ({stations.length})
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="md:hidden p-2 hover:bg-zinc-800 active:bg-zinc-700
                           rounded-lg transition-colors group"
                aria-label="Fermer le menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Filtres rapides améliorés */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  const newSort = sortBy === "price" ? null : "price";
                  setSortBy(newSort);
                  onSortChange(newSort || "");
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                           ${
                             sortBy === "price"
                               ? "bg-blue-600 text-white"
                               : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                           }`}
              >
                Prix croissant
              </button>

              {/* Bouton de distance conditionnel */}
              {navigator.geolocation && (
                <button
                  onClick={() => {
                    if (sortBy === "distance") {
                      setSortBy(null);
                      onSortChange("");
                    } else {
                      // Demander la localisation si nécessaire
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setSortBy("distance");
                          onSortChange("distance");
                        },
                        (error) => {
                          alert(
                            "Activez la localisation pour trier par distance"
                          );
                          console.error("Erreur de géolocalisation:", error);
                        }
                      );
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                             flex items-center gap-2
                             ${
                               sortBy === "distance"
                                 ? "bg-blue-600 text-white"
                                 : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                             }`}
                >
                  <span>Distance</span>
                  {sortBy !== "distance" && (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Sélecteur de carburant amélioré */}
            <div className="relative">
              <select
                value={selectedFuel}
                onChange={(e) => onFuelChange(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 rounded-lg
                         bg-zinc-800 border border-zinc-700
                         text-white text-sm font-medium
                         focus:border-blue-500 transition-colors"
              >
                <option value="sp95">Sans Plomb 95</option>
                <option value="sp98">Sans Plomb 98</option>
                <option value="gazole">Gazole</option>
                <option value="e85">E85</option>
                <option value="gplc">GPL</option>
              </select>
              <FaChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 
                                      text-zinc-400 pointer-events-none w-4 h-4"
              />
            </div>
          </div>

          {/* Liste des stations */}
          <div className="flex-1 overflow-auto">
            {stations?.length > 0 ? (
              <div className="p-4 space-y-3">
                {stations.map((station) => (
                  <div
                    key={station.id}
                    className="group relative p-4 bg-zinc-800 rounded-xl
                             hover:bg-zinc-750 transition-colors duration-200"
                  >
                    {/* En-tête de la station */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <div
                          className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 
                                        border border-blue-500/10
                                        flex items-center justify-center group"
                        >
                          <FaGasPump
                            className="w-6 h-6 text-white group-hover:text-blue-300 
                                               transition-colors duration-200"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {station.brand || station.name}
                          </h3>
                          <p className="text-sm text-zinc-400 line-clamp-1">
                            {station.address}
                          </p>
                        </div>
                      </div>

                      {/* Prix principal */}
                      <div className="flex flex-col items-end">
                        <div className="px-3 py-1 bg-green-600/20 rounded-lg">
                          <span className="text-green-400 font-semibold">
                            {formatPrice(getFuelPrice(station, selectedFuel))}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 mt-1">
                          {selectedFuel.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Grille des prix */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {Object.entries(station.prices)
                        .filter(([_, price]) => price !== null)
                        .map(([fuel, price]) => (
                          <div
                            key={fuel}
                            className={`px-2 py-1 rounded bg-zinc-700/50
                                      ${
                                        fuel === selectedFuel
                                          ? "ring-1 ring-blue-500"
                                          : ""
                                      }`}
                          >
                            <div className="text-xs text-zinc-400">
                              {fuel.toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-white">
                              {formatPrice(price)}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Footer avec services et actions */}
                    <div
                      className="flex items-center justify-between pt-3 
                                  border-t border-zinc-700/50"
                    >
                      <div className="flex gap-2">
                        {station.services?.includes("24/24") && (
                          <span
                            className="px-2 py-1 text-xs font-medium 
                                       bg-blue-500/20 text-blue-400 rounded"
                          >
                            24/24
                          </span>
                        )}
                        {/* Autres services... */}
                      </div>

                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 
                                 bg-blue-600 hover:bg-blue-700
                                 rounded-lg text-white text-sm font-medium
                                 transition-colors"
                      >
                        <FaLocationArrow className="w-3.5 h-3.5" />
                        <span>Itinéraire</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                {/* État vide amélioré - voir code précédent */}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
