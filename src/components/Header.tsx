import React, { useState } from "react";
import L from "leaflet";
import { FaBars, FaSearch, FaMapMarkerAlt, FaGasPump } from "react-icons/fa";
import { FuelStation } from "../services/stationService";
interface HeaderProps {
  mapRef: React.RefObject<L.Map | null>;
  onToggleSidebar: () => void;
  stations?: FuelStation[];
}

export default function Header({
  mapRef,
  onToggleSidebar,
  stations,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationMarker, setLocationMarker] = useState<L.Marker | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&format=json&addressdetails=1`
      );
      const data = await response.json();

      if (data.length > 0 && mapRef.current) {
        const { lat, lon } = data[0];
        mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 13);
      } else {
        setSearchError(
          "Ville introuvable. Vérifiez l'orthographe et réessayez."
        );
      }
    } catch (error) {
      setSearchError("Une erreur est survenue lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef.current) {
            const { latitude, longitude } = position.coords;

            // Supprime l'ancien marqueur s'il existe
            if (locationMarker) {
              locationMarker.remove();
            }

            // Crée un nouveau marqueur avec une icône personnalisée
            const newMarker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: "location-marker",
                html: `
                  <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg relative">
                    <div class="absolute w-full h-full rounded-full bg-blue-500 animate-ping opacity-75"></div>
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
            }).addTo(mapRef.current);

            setLocationMarker(newMarker);
            mapRef.current.setView([latitude, longitude], 13);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation :", error);
          alert(
            "Impossible de récupérer votre position. Veuillez vérifier vos paramètres de localisation."
          );
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="px-4 py-3">
          <div className="flex flex-col gap-3">
            {/* Logo et Menu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 
                               flex items-center justify-center group transition-transform hover:scale-105"
                  >
                    <FaGasPump className="w-5 h-5 text-white/90 group-hover:text-white" />
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-green-500 rounded-full 
                                 flex items-center justify-center border-2 border-zinc-900"
                  >
                    <span className="text-[10px] font-medium text-white">
                      LIVE
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-medium text-white tracking-tight leading-none">
                    Pump
                    <span className="text-blue-400 font-semibold">Finder</span>
                  </h1>
                  <span className="text-xs text-zinc-400">
                    Prix en temps réel
                  </span>
                </div>
              </div>

              <button
                onClick={onToggleSidebar}
                className="flex items-center gap-2.5 px-4 py-2.5 
                         bg-gradient-to-r from-blue-600 to-blue-500
                         hover:from-blue-500 hover:to-blue-400
                         rounded-xl text-white text-sm font-medium
                         transition-all duration-200 active:scale-95"
              >
                <span>Stations à proximité</span>
                {stations && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span className="text-sm">{stations.length}</span>
                  </div>
                )}
              </button>
            </div>

            {/* Barre de recherche et localisation */}
            <div className="flex gap-2">
              <div className="flex-1 relative group">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchError(null);
                    }}
                    placeholder="Rechercher une ville..."
                    className={`w-full pl-11 pr-4 py-3 outline-none text-[16px]
                               ${
                                 searchError
                                   ? "border-red-500/50 focus:border-red-500/50"
                                   : "border-zinc-700/50 focus:border-blue-500/50"
                               } 
                               bg-zinc-800/50 border rounded-xl text-white
                               placeholder:text-zinc-500
                               focus:bg-zinc-800 transition-all duration-200`}
                  />
                  {isSearching ? (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <div
                        className="w-4 h-4 border-2 border-blue-500 border-t-transparent 
                                     rounded-full animate-spin"
                      />
                    </div>
                  ) : (
                    <FaSearch
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 
                                        text-zinc-400 group-hover:text-zinc-300 transition-colors"
                    />
                  )}
                </form>
                {searchQuery && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-zinc-400 hover:text-zinc-300 p-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Message d'erreur compact avec icône d'exclamation */}
              {searchError && (
                <div
                  className="absolute -bottom-14 left-4 max-w-[90%] px-4 py-3 
                                bg-red-900 border border-red-800 
                                rounded-lg shadow-lg"
                >
                  <div className="flex items-center gap-2 text-red-200">
                    <svg
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
                    </svg>
                    <span className="text-sm font-medium truncate">
                      {searchError}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleGetLocation}
                className="flex items-center justify-center w-12 h-12
                         bg-zinc-800/50 hover:bg-zinc-700/50 
                         border border-zinc-700/50 hover:border-zinc-600/50
                         rounded-xl text-blue-400 hover:text-blue-300
                         transition-all duration-200 active:scale-95
                         relative group"
              >
                <FaMapMarkerAlt className="w-5 h-5" />
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full 
                              opacity-0 group-hover:opacity-100 transition-opacity"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            {/* Logo et Menu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-blue-600 
                             flex items-center justify-center"
                >
                  <FaGasPump className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-medium text-white tracking-tight">
                  Pump
                  <span className="text-blue-400 font-semibold">Finder</span>
                </h1>
              </div>

              <button
                onClick={handleGetLocation}
                className="flex items-center gap-2.5 px-4 py-2.5 
                         bg-blue-600 hover:bg-blue-700
                         rounded-xl text-white text-sm font-medium
                         transition-colors duration-200"
              >
                <FaMapMarkerAlt className="w-4 h-4" />
                <span>Ma position</span>
              </button>
            </div>

            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une ville, une adresse..."
                className="w-full pl-11 pr-4 py-3 bg-zinc-800 text-[16px]
                         border border-zinc-700 rounded-xl text-white
                         placeholder:text-zinc-500
                         focus:border-blue-500 focus:bg-zinc-700
                         transition-colors duration-200"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

// Utilisation avec OpenStreetMap Nominatim
async function searchAddress(
  query: string,
  mapRef: React.RefObject<L.Map | null>
) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
  );
  const data = await response.json();
  if (data.length > 0 && mapRef.current) {
    mapRef.current.setView([data[0].lat, data[0].lon], 16);
  }
}
