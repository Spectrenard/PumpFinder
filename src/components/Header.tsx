import React, { useState } from "react";
import L from "leaflet";

interface HeaderProps {
  mapRef: React.RefObject<L.Map | null>;
}

export default function Header({ mapRef }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <header className="p-6">
      <div className="container mx-auto">
        <div className="glass-effect rounded-2xl p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
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
                    d="M19 14c0-1.657-3.134-3-7-3s-7 1.343-7 3m14 0v4c0 1.657-3.134 3-7 3s-7-1.343-7-3v-4m14 0c0-1.657-3.134-3-7-3s-7 1.343-7 3m7-10a2 2 0 100-4 2 2 0 000 4z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                PumpFinder
              </h1>
            </div>

            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une adresse..."
                  className="input-search"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2"
                >
                  Rechercher
                </button>
              </form>
            </div>

            <button className="btn-primary flex items-center gap-2">
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
