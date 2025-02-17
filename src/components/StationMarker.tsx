import { FaGasPump } from "react-icons/fa";
import L from "leaflet";
import { renderToString } from "react-dom/server";

interface StationMarkerProps {
  latitude: number;
  longitude: number;
  popupContent: string;
}

export const createStationMarker = ({
  latitude,
  longitude,
  popupContent,
}: StationMarkerProps) => {
  const iconHtml = renderToString(
    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg">
      <FaGasPump className="text-white text-xl" />
    </div>
  );

  return L.marker([latitude, longitude], {
    icon: L.divIcon({
      className: "station-marker",
      html: iconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    }),
  }).bindPopup(popupContent);
};
