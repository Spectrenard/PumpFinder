// Types existants...
export interface FuelStation {
  id: string;
  brand: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  prices: {
    gazole?: number | null;
    sp95?: number | null;
    sp98?: number | null;
    e85?: number | null;
    gplc?: number | null;
  };
  services?: string[];
  lastUpdate: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  lastUpdate: string;
  power: number;
  chargingPoints: number;
  connectorTypes: string[];
}

// Nouvelles interfaces pour les props des composants
export interface StationCardProps {
  station: FuelStation;
  selectedFuel: string;
  formatPrice: (price: number | null | undefined) => string;
  getFuelPrice: (station: FuelStation, fuel: string) => number | null;
}

export interface ChargingCardProps {
  station: ChargingStation;
}

export interface SidebarProps {
  stations: FuelStation[];
  chargingStations: ChargingStation[];
  selectedFuel: string;
  onFuelChange: (fuel: string) => void;
  onSortChange: (sort: string) => void;
  isOpen: boolean;
  onClose: () => void;
}
