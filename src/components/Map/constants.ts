import L from "leaflet";

export const FRANCE_BOUNDS = {
  southWest: L.latLng(41.333, -4.87),
  northEast: L.latLng(51.124, 8.23),
};

export const MAP_OPTIONS = {
  zoomControl: false,
  attributionControl: false,
  fadeAnimation: false,
  zoomAnimation: false,
  markerZoomAnimation: false,
  minZoom: 5.5,
  maxZoom: 18,
  maxBoundsViscosity: 1.0,
};

export const MARKER_CLUSTER_OPTIONS = {
  chunkedLoading: true,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
};
