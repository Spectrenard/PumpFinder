import { useState } from "react";
import { FaBolt } from "react-icons/fa";
import FuelSelect from "./filters/FuelSelect";
import { StationCard } from "./cards/StationCard";
import { SidebarProps, FuelStation } from "./types";
import { ChargingStationCard } from "./cards/ChargingStationCard";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarFilters } from "./filters/SidebarFilters";

export default function Sidebar({
  stations = [],
  chargingStations = [],
  selectedFuel,
  onFuelChange,
  onSortChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const [filter, setFilter] = useState<"all" | "fuel" | "charging">("all");
  const [priceFilter, setPriceFilter] = useState<"asc" | "desc" | null>(null);

  // Fonctions utilitaires
  const formatPrice = (price: number | null | undefined) => {
    return price ? `${price.toFixed(2)} €/L` : "Non disponible";
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

  // Fonction pour trier les stations par prix
  const sortStationsByPrice = (stationsToSort: FuelStation[]) => {
    if (!priceFilter) return stationsToSort;

    return [...stationsToSort].sort((a, b) => {
      const priceA = getFuelPrice(a, selectedFuel) || Infinity;
      const priceB = getFuelPrice(b, selectedFuel) || Infinity;

      return priceFilter === "asc" ? priceA - priceB : priceB - priceA;
    });
  };

  // Tri des stations
  const sortedStations = sortStationsByPrice(stations);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:static top-0 left-0 h-full w-[85vw] md:w-96 
                    bg-zinc-900 border-r border-zinc-800 z-50 
                    transform transition-all duration-300 
                    ${
                      isOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                    }`}
      >
        <div className="h-full flex flex-col">
          <SidebarHeader
            stationCount={stations.length + chargingStations.length}
            onClose={onClose}
          />

          <SidebarFilters
            filter={filter}
            setFilter={setFilter}
            selectedFuel={selectedFuel}
            onFuelChange={onFuelChange}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
          />

          {/* Liste des stations */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* Rendu conditionnel des stations */}
              {(filter === "all" || filter === "fuel") && (
                <div className="space-y-3">
                  {sortedStations.map((station, index) => (
                    <StationCard
                      key={`${station.id}-${index}`}
                      station={station}
                      selectedFuel={selectedFuel}
                      getFuelPrice={
                        getFuelPrice as (
                          station: FuelStation,
                          fuel: string
                        ) => number | null
                      }
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              )}

              {/* Rendu des bornes de recharge */}
              {(filter === "all" || filter === "charging") && (
                <div className="space-y-3">
                  {chargingStations.map((station, index) => (
                    <ChargingStationCard
                      key={`${station.id}-${index}`}
                      station={station}
                    />
                  ))}
                </div>
              )}

              {/* Message si aucun résultat */}
              {stations.length === 0 && chargingStations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-zinc-400">
                    Aucun point de ravitaillement trouvé
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
