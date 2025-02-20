import { FaGasPump, FaBolt } from "react-icons/fa";
import FuelSelect from "./FuelSelect";

interface SidebarFiltersProps {
  filter: "all" | "fuel" | "charging";
  setFilter: (filter: "all" | "fuel" | "charging") => void;
  selectedFuel: string;
  onFuelChange: (fuel: string) => void;
  priceFilter: "asc" | "desc" | null;
  setPriceFilter: (filter: "asc" | "desc" | null) => void;
}

export function SidebarFilters({
  filter,
  setFilter,
  selectedFuel,
  onFuelChange,
  priceFilter,
  setPriceFilter,
}: SidebarFiltersProps) {
  return (
    <div className="p-4 border-b border-zinc-800">
      <div className="space-y-3">
        {/* Type de station */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2
                     ${
                       filter === "all"
                         ? "bg-zinc-700 text-white"
                         : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                     }`}
          >
            <span>Tout</span>
          </button>
          <button
            onClick={() => setFilter("fuel")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2
                     ${
                       filter === "fuel"
                         ? "bg-blue-600 text-white"
                         : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                     }`}
          >
            <FaGasPump className="w-4 h-4" />
            <span>Carburants</span>
          </button>
          <button
            onClick={() => setFilter("charging")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2
                     ${
                       filter === "charging"
                         ? "bg-green-600 text-white"
                         : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                     }`}
          >
            <FaBolt className="w-4 h-4" />
            <span>Bornes</span>
          </button>
        </div>

        {/* Filtres spécifiques selon le mode */}
        {(filter === "all" || filter === "fuel") && (
          <div className="space-y-3">
            <FuelSelect value={selectedFuel} onChange={onFuelChange} />

            {/* Filtre de prix */}
            <div className="flex gap-2">
              <button
                onClick={() => setPriceFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium
                        ${
                          !priceFilter
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
              >
                Par défaut
              </button>
              <button
                onClick={() => setPriceFilter("asc")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2
                        ${
                          priceFilter === "asc"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
              >
                <span>Prix croissant</span>
              </button>
              <button
                onClick={() => setPriceFilter("desc")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2
                        ${
                          priceFilter === "desc"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
              >
                <span>Prix décroissant</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
