import React, { useState } from "react";
import L from "leaflet";
import { FaBars } from "react-icons/fa";
import { Icon } from "leaflet";

interface HeaderProps {
  mapRef: React.RefObject<L.Map | null>;
  onToggleSidebar: () => void;
}

export default function Header({ mapRef, onToggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationMarker, setLocationMarker] = useState<L.Marker | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

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
        alert("Aucun résultat trouvé pour cette recherche");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
      alert("Une erreur est survenue lors de la recherche");
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
    <header className="p-2 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14c0-1.657-3.134-3-7-3s-7 1.343-7 3m14 0v4c0 1.657-3.134 3-7 3s-7-1.343-7-3v-4m14 0c0-1.657-3.134-3-7-3s-7 1.343-7 3m7-10a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-blue-400">
                  PumpFinder
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGetLocation}
                  className="md:hidden w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-white/60 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
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
                </button>

                <button
                  onClick={onToggleSidebar}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors md:hidden"
                >
                  <FaBars className="w-5 h-5" />
                  <span className="text-sm font-medium">Voir les stations</span>

                  {/* Indicateur de notification */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse">
                    <span className="sr-only">
                      Nouvelles stations disponibles
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une adresse..."
                  className="w-full px-3 py-2.5 md:px-4 md:py-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/60 outline-none focus:ring-1 focus:ring-white/40 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors text-sm"
                >
                  Rechercher
                </button>
              </form>
            </div>

            <button
              onClick={handleGetLocation}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
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
              Ma position
            </button>
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
