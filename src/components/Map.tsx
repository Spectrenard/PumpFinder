"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { fetchNearbyStations, FuelStation } from "@/services/stationService";
import { createStationMarker } from "./StationMarker";
import Sidebar from "./Sidebar";
import "leaflet.markercluster";

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
  const markersRef = useRef<any | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initializeMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet.markercluster");

      if (typeof window !== "undefined" && !mapRef.current) {
        // Coordonnées des limites de la France métropolitaine
        const southWest = L.latLng(41.333, -4.87); // Sud-Ouest
        const northEast = L.latLng(51.124, 8.23); // Nord-Est
        const franceBounds = L.latLngBounds(southWest, northEast);

        mapRef.current = L.map("map", {
          zoomControl: false,
          attributionControl: false,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          minZoom: 5.5, // Zoom minimum pour voir toute la France
          maxZoom: 18, // Zoom maximum pour le détail
          maxBounds: franceBounds, // Limites de la carte
          maxBoundsViscosity: 1.0, // Force de "rebond" aux limites (1.0 = maximum)
        }).setView([46.603354, 1.888334], 6);

        // Ajouter un padding aux limites pour une meilleure expérience
        const paddedBounds = franceBounds.pad(0.1);
        mapRef.current.setMaxBounds(paddedBounds);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          bounds: franceBounds, // Limiter le chargement des tuiles à la France
        }).addTo(mapRef.current);

        // Initialiser MarkerClusterGroup
        const markerCluster = L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
        });

        markersRef.current = markerCluster;
        mapRef.current.addLayer(markerCluster);

        // Empêcher le déplacement hors des limites
        mapRef.current.on("drag", () => {
          mapRef.current?.panInsideBounds(paddedBounds, { animate: false });
        });

        // Charger les stations quand la carte bouge
        mapRef.current.on("moveend", async () => {
          const center = mapRef.current?.getCenter();
          if (center) {
            await loadNearbyStations(center.lat, center.lng);
          }
        });

        // Chargement initial
        const center = mapRef.current.getCenter();
        await loadNearbyStations(center.lat, center.lng);
      }
    };

    initializeMap();
  }, [isMounted]);

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

  // Fonction pour charger les stations
  const loadNearbyStations = async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      const L = (await import("leaflet")).default;
      const nearbyStations = await fetchNearbyStations(lat, lon);
      setStations(nearbyStations);

      if (markersRef.current) {
        markersRef.current.clearLayers();

        nearbyStations.forEach((station: FuelStation) => {
          const marker = L.marker([station.latitude, station.longitude], {
            icon: L.divIcon({
              className: "station-marker",
              html: `<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <i class="fas fa-gas-pump text-sm"></i>
                    </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            }),
          });

          const popupContent = `
            <div class="p-4">
              <h3 class="font-bold text-lg">${
                station.brand || "Station service"
              }</h3>
              <p class="text-sm text-gray-600">${station.address}, ${
            station.city
          }</p>
              <div class="mt-2">
                ${Object.entries(station.prices)
                  .filter(([_, price]) => price !== null)
                  .map(
                    ([fuel, price]) => `
                    <div class="flex justify-between items-center py-1">
                      <span class="font-medium">${fuel.toUpperCase()}</span>
                      <span class="text-blue-600 font-bold">${price?.toFixed(
                        3
                      )}€</span>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersRef.current.addLayer(marker);
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
