import L from "leaflet";
import { renderToString } from "react-dom/server";
import { FuelStation } from "../../services/stationService";
import { ChargingStation } from "../../services/chargingStationService";
import { MARKER_CLUSTER_OPTIONS } from "./constants";
import StationPopup from "./popups/StationPopup";
import ChargingStationPopup from "./popups/ChargingStationPopup";

export const createFuelMarkerCluster = () => {
  return L.markerClusterGroup({
    ...MARKER_CLUSTER_OPTIONS,
    iconCreateFunction: (cluster) => {
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
};

export const createChargingMarkerCluster = () => {
  return L.markerClusterGroup({
    ...MARKER_CLUSTER_OPTIONS,
    iconCreateFunction: (cluster) => {
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
};

export const createStationMarker = (station: FuelStation) => {
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

  const popupContent = renderToString(StationPopup({ station }));
  marker.bindPopup(popupContent, { className: "custom-popup" });
  return marker;
};

export const createChargingStationMarker = (station: ChargingStation) => {
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

  const popupContent = renderToString(ChargingStationPopup({ station }));
  marker.bindPopup(popupContent, { className: "custom-popup" });
  return marker;
};
