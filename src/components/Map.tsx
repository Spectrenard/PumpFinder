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
import { renderToString } from "react-dom/server";
import StationPopup from "./StationPopup";
import { ChargingStation } from "@/services/chargingStationService";
import { fetchNearbyChargingStations } from "@/services/chargingStationService";
import ChargingStationPopup from "./ChargingStationPopup";
import { FaBolt, FaGasPump } from "react-icons/fa";

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
  displayMode: "fuel" | "charging";
  onDisplayModeChange: (mode: "fuel" | "charging") => void;
}

export default function Map({
  mapRef,
  isSidebarOpen,
  onCloseSidebar,
  displayMode,
  onDisplayModeChange,
}: MapProps) {
  const [selectedFuel, setSelectedFuel] = useState("sp95");
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(
    []
  );
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
      const [nearbyFuelStations, nearbyChargingStations] = await Promise.all([
        fetchNearbyStations(lat, lon),
        fetchNearbyChargingStations(lat, lon),
      ]);

      setStations(nearbyFuelStations);
      setChargingStations(nearbyChargingStations);

      if (markersRef.current) {
        markersRef.current.clearLayers();

        // Créer deux groupes de marqueurs distincts
        const fuelMarkerCluster = L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: function (cluster) {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div class="bg-blue-500 rounded-full flex items-center justify-center text-white font-medium" style="width: 30px; height: 30px;">
                ${count}
              </div>`,
              className: "custom-marker-cluster",
              iconSize: L.point(30, 30),
            });
          },
        });

        const chargingMarkerCluster = L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: function (cluster) {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div class="bg-green-500 rounded-full flex items-center justify-center text-white font-medium" style="width: 30px; height: 30px;">
                ${count}
              </div>`,
              className: "custom-marker-cluster",
              iconSize: L.point(30, 30),
            });
          },
        });

        // Ajouter les stations essence au groupe bleu
        nearbyFuelStations.forEach((station: FuelStation) => {
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

          const popupContent = renderToString(
            <StationPopup station={station} />
          );
          marker.bindPopup(popupContent, {
            className: "custom-popup",
          });
          fuelMarkerCluster.addLayer(marker);
        });

        // Ajouter les bornes de recharge au groupe vert
        nearbyChargingStations.forEach((station) => {
          const marker = L.marker([station.latitude, station.longitude], {
            icon: L.divIcon({
              className: "charging-station-marker",
              html: `<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <i class="fas fa-bolt text-sm"></i>
                    </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            }),
          });

          const popupContent = renderToString(
            <ChargingStationPopup station={station} />
          );
          marker.bindPopup(popupContent, {
            className: "custom-popup",
          });
          chargingMarkerCluster.addLayer(marker);
        });

        // Ajouter les deux groupes à la carte
        mapRef.current?.addLayer(fuelMarkerCluster);
        mapRef.current?.addLayer(chargingMarkerCluster);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stations:", error);
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
      <div class="min-w-[280px] p-3 bg-zinc-900 text-white rounded-lg">
        <!-- En-tête simplifié -->
        <div class="flex items-center gap-2 mb-3">
          <div class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-4 4h-4" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-white">${station.name}</h3>
            <p class="text-xs text-zinc-400">${station.address}</p>
          </div>
        </div>

        <!-- Prix en ligne -->
        <div class="flex flex-wrap gap-2 mb-3">
          ${Object.entries(station.prices)
            .map(
              ([fuel, price]) => `
              <div class="px-2 py-1 bg-zinc-800 rounded-lg">
                <span class="text-xs text-zinc-400">${fuel.toUpperCase()}</span>
                <span class="ml-2 text-sm font-medium text-green-400">${price}€/L</span>
              </div>
            `
            )
            .join("")}
        </div>

        <!-- Footer compact -->
        <div class="flex items-center justify-between text-xs text-zinc-500">
          <span>Mise à jour ${new Date(
            station.lastUpdate
          ).toLocaleString()}</span>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${
            station.latitude
          },${station.longitude}" 
             target="_blank"
             class="px-4 py-2 bg-blue-100/20 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors">
            Itinéraire
          </a>
        </div>
      </div>
    `;

    const marker = L.marker([station.latitude, station.longitude]).bindPopup(
      popupContent,
      {
        className: "custom-popup",
      }
    );

    markersRef.current.addLayer(marker);
  };

  return (
    <div className="absolute inset-0 flex">
      <Sidebar
        stations={stations}
        chargingStations={chargingStations}
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
