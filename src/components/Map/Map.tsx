import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapProps, MapState } from "./types";
import { FRANCE_BOUNDS, MAP_OPTIONS } from "./constants";
import {
  createFuelMarkerCluster,
  createChargingMarkerCluster,
  createStationMarker,
  createChargingStationMarker,
} from "./utils";
import { fetchNearbyStations } from "../../services/stationService";
import { fetchNearbyChargingStations } from "../../services/chargingStationService";
import Sidebar from "../Sidebar/Sidebar";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import StationPopup from "./popups/StationPopup";
import ChargingStationPopup from "./popups/ChargingStationPopup";

export default function Map({
  mapRef,
  isSidebarOpen,
  onCloseSidebar,
  displayMode,
  onDisplayModeChange,
}: MapProps) {
  const [state, setState] = useState<MapState>({
    selectedFuel: "sp95",
    stations: [],
    chargingStations: [],
    isLoading: true,
    userLocation: null,
  });

  const markersRef = useRef<L.LayerGroup | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initializeMap();
  }, []);

  const handleFuelChange = (fuel: string) => {
    setState((prev) => ({ ...prev, selectedFuel: fuel }));
  };

  const handleSortChange = (sortBy: string) => {
    // Implémentation du tri
  };

  const loadNearbyStations = async (lat: number, lon: number) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const [fuelStations, charging] = await Promise.all([
        fetchNearbyStations(lat, lon),
        fetchNearbyChargingStations(lat, lon),
      ]);

      setState((prev) => ({
        ...prev,
        stations: fuelStations,
        chargingStations: charging,
      }));

      updateMarkers(fuelStations, charging);
    } catch (error) {
      console.error("Erreur lors du chargement des stations:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const updateMarkers = (fuelStations: any[], chargingStations: any[]) => {
    if (!mapRef.current) return;

    // Nettoyer les marqueurs existants
    markersRef.current?.clearLayers();

    const fuelCluster = createFuelMarkerCluster();
    const chargingCluster = createChargingMarkerCluster();

    // Ajouter les nouveaux marqueurs
    fuelStations.forEach((station) => {
      const marker = createStationMarker(station);
      fuelCluster.addLayer(marker);
    });

    chargingStations.forEach((station) => {
      const marker = createChargingStationMarker(station);
      chargingCluster.addLayer(marker);
    });

    mapRef.current.addLayer(fuelCluster);
    mapRef.current.addLayer(chargingCluster);
    markersRef.current = L.layerGroup([fuelCluster, chargingCluster]);
  };

  const initializeMap = async () => {
    if (typeof window !== "undefined" && !mapRef.current) {
      const paddedBounds = L.latLngBounds(
        FRANCE_BOUNDS.southWest,
        FRANCE_BOUNDS.northEast
      ).pad(0.1);

      mapRef.current = L.map("map", {
        ...MAP_OPTIONS,
        maxBounds: paddedBounds,
      }).setView([46.603354, 1.888334], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        bounds: paddedBounds,
      }).addTo(mapRef.current);

      // Événements de la carte
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

  return (
    <div className="absolute inset-0 flex">
      <Sidebar
        {...state}
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
