import L from "leaflet";
import { FuelStation } from "../../services/stationService";
import { ChargingStation } from "../../services/chargingStationService";

export interface MapProps {
  mapRef: React.RefObject<L.Map | null>;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  displayMode: "fuel" | "charging";
  onDisplayModeChange: (mode: "fuel" | "charging") => void;
}

export interface MarkerClusterOptions {
  chunkedLoading: boolean;
  spiderfyOnMaxZoom: boolean;
  showCoverageOnHover: boolean;
  zoomToBoundsOnClick: boolean;
  iconCreateFunction?: (cluster: L.MarkerCluster) => L.DivIcon;
}

export interface MapState {
  selectedFuel: string;
  stations: FuelStation[];
  chargingStations: ChargingStation[];
  isLoading: boolean;
  userLocation: [number, number] | null;
}
