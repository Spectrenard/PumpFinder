import L from "leaflet";
import { ChargingStation } from "@/services/chargingStationService";

export function createChargingStationMarker(station: ChargingStation) {
  return L.divIcon({
    className: "charging-station-marker",
    html: `
      <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}
