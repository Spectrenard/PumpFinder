import { useState } from "react";
import { FaGasPump, FaLocationArrow, FaClock } from "react-icons/fa";

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
}

export default function Sidebar({
  stations = [],
  selectedFuel,
  onFuelChange,
  onSortChange,
}: SidebarProps) {
  const [sortBy, setSortBy] = useState("price");

  const formatPrice = (price: number | null | undefined) => {
    return price ? `${price.toFixed(3)} €/L` : "N/A";
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
    <div className="w-96 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        <h2 className="text-xl font-bold text-blue-400 mb-6">
          Stations à proximité
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            className="w-full sm:w-1/2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
            value={selectedFuel}
            onChange={(e) => onFuelChange(e.target.value)}
          >
            <option value="all">Tous les carburants</option>
            <option value="sp95">SP95</option>
            <option value="sp98">SP98</option>
            <option value="gazole">Diesel</option>
            <option value="e85">E85</option>
          </select>

          <select
            className="w-full sm:w-1/2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              onSortChange(e.target.value);
            }}
          >
            <option value="price">Prix croissant</option>
            <option value="distance">Distance</option>
          </select>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {stations && stations.length > 0 ? (
              stations.map((station) => (
                <div
                  key={station.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
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
                        <div className="flex items-center gap-1 text-sm text-white/60 mt-1">
                          <FaLocationArrow className="w-4 h-4" />
                          <span>À proximité</span>
                        </div>
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

                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      {getStationServices(station).map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-lg bg-white/5 text-sm flex items-center gap-1"
                        >
                          {service.icon}
                          {service.label}
                        </span>
                      ))}
                    </div>
                    <button
                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm whitespace-nowrap"
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
  );
}
