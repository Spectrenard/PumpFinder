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
}

export default function Map({ mapRef }: MapProps) {
  const [selectedFuel, setSelectedFuel] = useState("sp95");
  const [stations, setStations] = useState<FuelStation[]>([]);
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
    const map = L.map("map").setView([46.227638, 2.213749], 6); // Centre sur la France
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Création du groupe de marqueurs
    markersRef.current = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    map.addLayer(markersRef.current);

    // Charger les stations quand la carte s'arrête de bouger
    map.on("moveend", async () => {
      const center = map.getCenter();
      if (center) {
        await loadNearbyStations(center.lat, center.lng);
      }
    });

    // Chargement initial des stations
    const center = map.getCenter();
    loadNearbyStations(center.lat, center.lng);

    // Bouton de géolocalisation
    const locationButton = new L.Control({ position: "bottomright" });
    locationButton.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      div.innerHTML = `
        <button class="btn-primary p-2 rounded-lg" title="Ma position">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        </button>
      `;
      div.onclick = () => getUserLocation();
      return div;
    };
    locationButton.addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fonction pour charger les stations
  const loadNearbyStations = async (lat: number, lon: number) => {
    const nearbyStations = await fetchNearbyStations(lat, lon);
    setStations(nearbyStations);

    if (markersRef.current) {
      markersRef.current.clearLayers();

      nearbyStations.forEach((station: FuelStation) => {
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
            <div class="mt-2 text-xs text-gray-500">
              Dernière mise à jour: ${new Date(
                station.lastUpdate
              ).toLocaleString()}
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
    <div className="absolute inset-0 flex gap-6">
      <Sidebar
        stations={stations}
        selectedFuel={selectedFuel}
        onFuelChange={handleFuelChange}
        onSortChange={handleSortChange}
      />
      <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl relative">
        <div id="map" className="w-full h-full" />
        {!stations.length && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-medium">Chargement des stations...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
