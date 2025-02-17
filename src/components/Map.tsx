"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { fetchNearbyStations, FuelStation } from "@/services/stationService";
import { FaGasPump } from "react-icons/fa";
import { createStationMarker } from "./StationMarker";
import Sidebar from "./Sidebar";

type Station = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  prices: {
    diesel?: number;
    sp95?: number;
    sp98?: number;
    e85?: number;
  };
  services: string[];
  lastUpdate: string;
};

interface MapProps {
  mapRef: React.RefObject<L.Map | null>;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

export default function Map({
  mapRef,
  isSidebarOpen,
  onCloseSidebar,
}: MapProps) {
  const [selectedFuel, setSelectedFuel] = useState("sp95");
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  const handleFuelChange = (fuel: string) => {
    setSelectedFuel(fuel);
    // Mettre à jour les stations si nécessaire
  };

  const handleSortChange = (sortBy: string) => {
    const sortedStations = [...stations].sort((a, b) => {
      if (sortBy === "price") {
        return (
          (a.prices[selectedFuel as keyof typeof a.prices] || 0) -
          (b.prices[selectedFuel as keyof typeof b.prices] || 0)
        );
      }
      // Ajouter d'autres critères de tri si nécessaire
      return 0;
    });
    setStations(sortedStations);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !mapRef.current) {
      // Initialisation de la carte
      mapRef.current = L.map("map", {
        zoomControl: false,
        attributionControl: false,
        // Désactiver l'overlay de chargement pendant les mouvements
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false,
      }).setView([46.603354, 1.888334], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Création du groupe de marqueurs
      markersRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });

      mapRef.current.addLayer(markersRef.current);

      // Charger les stations quand la carte s'arrête de bouger
      mapRef.current.on("moveend", async () => {
        const center = mapRef.current?.getCenter();
        if (center) {
          await loadNearbyStations(center.lat, center.lng);
        }
      });

      // Chargement initial des stations
      const center = mapRef.current?.getCenter();
      loadNearbyStations(center?.lat || 0, center?.lng || 0);
    }
  }, []);

  // Fonction pour charger les stations
  const loadNearbyStations = async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      const nearbyStations = await fetchNearbyStations(lat, lon);
      setStations(nearbyStations);

      if (markersRef.current) {
        markersRef.current.clearLayers();

        nearbyStations.forEach((station: FuelStation) => {
          const popupContent = `
            <div class="min-w-[300px] p-4 text-gray-900">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-lg">${
                    station.brand || "Station service"
                  }</h3>
                  <p class="text-sm text-gray-600">${station.address}, ${
            station.city
          }</p>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-3 mb-3">
                ${Object.entries(station.prices)
                  .filter(([_, price]) => price !== null)
                  .map(
                    ([fuel, price]) => `
                    <div class="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                      <span class="font-medium text-gray-700">${fuel.toUpperCase()}</span>
                      <span class="text-blue-600 font-bold">${price?.toFixed(
                        2
                      )} €</span>
                    </div>
                  `
                  )
                  .join("")}
              </div>

              <div class="flex items-center gap-2 text-xs text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Mise à jour : ${new Date(station.lastUpdate).toLocaleString()}
              </div>
            </div>
          `;

          const marker = createStationMarker({
            latitude: station.latitude,
            longitude: station.longitude,
            popupContent,
          });

          markersRef.current?.addLayer(marker);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier la fonction getUserLocation
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);

          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 14);

            // Charger les stations à proximité
            loadNearbyStations(latitude, longitude);

            // Ajouter un cercle pour montrer la zone proche
            L.circle([latitude, longitude], {
              radius: 2000,
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.1,
              weight: 1,
            }).addTo(mapRef.current);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          alert("Impossible de récupérer votre position");
        }
      );
    }
  };

  // Fonction pour ajouter une station sur la carte
  const addStationMarker = (station: Station) => {
    if (!markersRef.current) return;

    const popupContent = `
      <div class="p-2">
        <h3 class="font-bold">${station.name}</h3>
        <p class="text-sm text-gray-600">${station.address}</p>
        <div class="mt-2">
          ${Object.entries(station.prices)
            .map(
              ([fuel, price]) => `
              <div class="flex justify-between">
                <span>${fuel.toUpperCase()}:</span>
                <span class="font-bold">${price}€/L</span>
              </div>
            `
            )
            .join("")}
        </div>
        <div class="mt-2 text-sm text-gray-500">
          Mise à jour: ${new Date(station.lastUpdate).toLocaleString()}
        </div>
      </div>
    `;

    const marker = L.marker([station.latitude, station.longitude]).bindPopup(
      popupContent
    );

    markersRef.current.addLayer(marker);
  };

  return (
    <div className="absolute inset-0 flex">
      <Sidebar
        stations={stations}
        selectedFuel={selectedFuel}
        onFuelChange={handleFuelChange}
        onSortChange={handleSortChange}
        isOpen={isSidebarOpen}
        onClose={onCloseSidebar}
      />
      <div className="flex-1 relative">
        <div id="map" className="w-full h-full z-0" />
      </div>
    </div>
  );
}
