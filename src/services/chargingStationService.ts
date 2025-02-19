const API_URL = "https://public.opendatasoft.com/api/records/1.0/search/";
const DATASET = "mobilityref-france-irve-220";

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  city: string;
  operator: string;
  latitude: number;
  longitude: number;
  power: number;
  chargingPoints: number;
  connectorTypes: string[];
  paymentMethods: string[];
  accessType: string;
  schedule: string;
  lastUpdate: string;
  observations: string;
  department: string;
  region: string;
}

export async function fetchNearbyChargingStations(
  lat: number,
  lon: number,
  radius: number = 10
): Promise<ChargingStation[]> {
  try {
    const geoFilter = `distance(geo_point_2d,${lat},${lon},${radius}km)`;
    const response = await fetch(
      `${API_URL}?dataset=${DATASET}&rows=100&geofilter.distance=${lat},${lon},${
        radius * 1000
      }`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.records.map((record: any) => {
      const fields = record.fields;
      return {
        id: fields.id_station_itinerance || record.recordid,
        name: fields.nom_station || "Station sans nom",
        address: fields.adresse_station || "Adresse non disponible",
        city: fields.com_arm_name || "",
        operator: fields.nom_operateur || "Opérateur inconnu",
        latitude: parseFloat(fields.latitude),
        longitude: parseFloat(fields.longitude),
        power: fields.puissance_nominale || 0,
        chargingPoints: fields.nbre_pdc || 1,
        connectorTypes: [
          fields.prise_type_combo_ccs === "1" && "Combo CCS",
          fields.prise_type_chademo === "1" && "CHAdeMO",
          fields.prise_type_2 === "1" && "Type 2",
          fields.prise_type_ef === "1" && "Type EF",
        ].filter(Boolean),
        paymentMethods: [
          fields.paiement_cb === "1" && "Carte bancaire",
          fields.paiement_acte === "1" && "À l'acte",
          fields.paiement_autre === "1" && "Autre",
        ].filter(Boolean),
        accessType: fields.condition_acces || "Non spécifié",
        schedule: fields.horaires || "Non spécifié",
        lastUpdate: fields.date_maj || new Date().toISOString(),
        observations: fields.observations || "",
        department: fields.dep_name || "",
        region: fields.reg_name || "",
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des bornes:", error);
    return [];
  }
}
