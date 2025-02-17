// Alternative avec l'API gouvernementale
const API_URL = "https://public.opendatasoft.com/api/records/1.0/search/";
const DATASET = "prix_des_carburants_j_7";

// ou si ça ne marche pas :
// const API_URL = "https://www.prix-carburants.gouv.fr/api/open-data/prix-carburants";

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
  lastUpdate: string;
  services: string[];
  automate24: boolean;
  shortage: string[];
  presence: "A" | "R";
}

export async function fetchNearbyStations(
  lat: number,
  lon: number,
  radius: number = 10
) {
  try {
    console.log("Recherche des stations autour de:", { lat, lon, radius });

    const response = await fetch(
      `${API_URL}?dataset=${DATASET}&geofilter.distance=${lat},${lon},${
        radius * 1000
      }&rows=100`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transformer les données
    const stations = data.records
      .filter((record: any) => record.fields)
      .map((record: any) => {
        const fields = record.fields;

        // Convertir les prix (ils sont en milliers d'euros)
        const prices = {
          gazole: fields.price_gazole ? fields.price_gazole * 1000 : null,
          sp95: fields.price_e10 ? fields.price_e10 * 1000 : null,
          sp98: fields.price_sp98 ? fields.price_sp98 * 1000 : null,
          e85: fields.price_e85 ? fields.price_e85 * 1000 : null,
          gplc: fields.price_gplc ? fields.price_gplc * 1000 : null,
        };

        return {
          id: fields.id || record.recordid,
          brand: fields.brand || "",
          name: fields.name || fields.brand || "Station service",
          address: fields.address,
          city: fields.city,
          latitude: fields.geo_point[0],
          longitude: fields.geo_point[1],
          prices,
          lastUpdate: fields.update || record.record_timestamp,
          services: fields.services ? fields.services.split("/") : [],
          automate24: fields.automate_24_24 === "Oui",
          shortage: fields.shortage ? fields.shortage.split("/") : [],
          presence: fields.highway === "1" ? "A" : "R",
        };
      });

    console.log("Stations transformées:", stations);
    return stations;
  } catch (error) {
    console.error("Erreur détaillée:", error);
    return [];
  }
}

// Fonction pour calculer la distance entre deux points (en km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function testAPI() {
  try {
    const response = await fetch(`${API_URL}&rows=10`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Données brutes:", data);

    return data;
  } catch (error) {
    console.error("Erreur lors du test de l'API:", error);
    return null;
  }
}
