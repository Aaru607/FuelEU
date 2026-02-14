// Pure domain types for FuelEU compliance

export interface Route {
  id: string;
  origin: string;
  destination: string;
  // optional metadata used by domain (km)
  distanceKm?: number;
  // actual measured intensity in gCO2e/MJ from ship_compliance
  actualIntensity?: number;
}

export interface ComplianceRecord {
  id: string;
  routeId: string;
  // fuel consumption in tonnes (or the agreed unit for input)
  fuelConsumption: number;
  // actual measured intensity in gCO2e/MJ
  actualIntensity: number;
  // ISO period or year (e.g., "2025")
  period: string;
  poolId?: string;
}

export interface Pool {
  id: string;
  name: string;
  memberRecordIds: string[];
}
