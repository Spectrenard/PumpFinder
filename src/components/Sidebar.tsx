import { useState } from "react";
import {
  FaGasPump,
  FaLocationArrow,
  FaClock,
  FaChevronDown,
  FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import FuelSelect from "./FuelSelect";

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

  const formatLastUpdate = (date: string) => {
    const updateDate = new Date(date);
    const timeAgo = formatDistanceToNow(updateDate, {
      addSuffix: true,
      locale: fr,
    });

    const formattedDate = format(updateDate, "dd/MM/yyyy", {
      locale: fr,
    });

    // Calcul de la fraîcheur des données
    const hoursAgo = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60);

    let statusColor = "text-green-400";
    if (hoursAgo > 48) {
      statusColor = "text-red-400";
    } else if (hoursAgo > 24) {
      statusColor = "text-orange-400";
    }

    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <FaClock className={`w-3.5 h-3.5 ${statusColor}`} />
          <span className="text-sm text-zinc-400">{timeAgo}</span>
        </div>
        <span className="text-xs text-zinc-500">
          Mis à jour le {formattedDate}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Overlay amélioré */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300"
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
            </div>

            {/* Sélecteur de carburant amélioré */}
            <FuelSelect value={selectedFuel} onChange={onFuelChange} />
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

                    {/* Footer avec date précise et temps relatif */}
                    <div
                      className="flex items-center justify-between pt-3 
                                    border-t border-zinc-700/50"
                    >
                      {formatLastUpdate(station.lastUpdate)}

                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 
                                   bg-blue-600 hover:bg-blue-700 rounded-lg 
                                   text-white font-medium transition-colors"
                      >
                        <FaLocationArrow className="w-3.5 h-3.5" />
                        <span>Itinéraire</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div
                  className="w-16 h-16 mb-6 rounded-full bg-zinc-800 
                                flex items-center justify-center"
                >
                  <FaGasPump className="w-8 h-8 text-zinc-600" />
                </div>

                <h3 className="text-xl font-medium text-white mb-3">
                  Aucune station trouvée
                </h3>

                <p className="text-zinc-400 text-sm max-w-[280px] mb-8">
                  Voici quelques suggestions pour trouver des stations :
                </p>

                <div className="space-y-4 w-full max-w-[280px]">
                  <div className="flex items-start gap-3 text-left">
                    <div
                      className="w-8 h-8 rounded-lg bg-zinc-800 flex-shrink-0
                                    flex items-center justify-center"
                    >
                      <FaSearch className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-200">
                        Recherchez une ville
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Utilisez la barre de recherche pour trouver une zone
                        spécifique
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <div
                      className="w-8 h-8 rounded-lg bg-zinc-800 flex-shrink-0
                                    flex items-center justify-center"
                    >
                      <FaMapMarkerAlt className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-200">
                        Déplacez la carte
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Explorez d'autres zones en déplaçant la carte ou en
                        zoomant
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bouton de réinitialisation des filtres si des filtres sont actifs */}
                {sortBy && (
                  <button
                    onClick={() => {
                      setSortBy(null);
                      onSortChange("");
                    }}
                    className="mt-8 px-4 py-2 bg-blue-600 rounded-lg text-white text-sm 
                               hover:bg-blue-700 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
