/**
 * Outbound Port: API Interface for backend communication
 * No framework dependencies, pure TypeScript interfaces
 */

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distanceKm?: number;
  actualIntensity?: number; // gCO2e/MJ
}

export interface ComplianceComparison {
  percentDifference: number;
  compliant: boolean;
  actualIntensity: number;
  baselineIntensity?: number;
}

export interface BankingResult {
  success: boolean;
  message: string;
  energyInScope?: number;
  amountBanked?: number;
  complianceBalance?: number;
}

export interface Pool {
  id: string;
  name: string;
  memberRecordIds: string[];
}

export interface PoolAllocations {
  routeId: string;
  beforeComplianceBalance: number;
  afterComplianceBalance: number;
}

export interface CreatePoolPayload {
  poolId: string;
  poolName: string;
  routeIds: string[];
  period: string;
}

/**
 * Outbound Port: Contract for backend API client
 * Implementations must reside in adapters/infrastructure
 */
export interface OutboundApiPort {
  // Routes
  getRoutes(): Promise<Route[]>;
  getRouteById(id: string): Promise<Route | null>;

  // Compliance
  compareRoutes(params: {
    routeId: string;
    actualIntensity: number;
    baselineIntensity?: number;
  }): Promise<ComplianceComparison>;

  // Banking
  getBanking(routeId: string): Promise<{ totalBanked: number }>;
  bankSurplus(params: {
    routeId: string;
    fuelConsumption: number;
    actualIntensity: number;
    amountToBan: number;
    target?: number;
    period: string;
  }): Promise<BankingResult>;

  // Pools
  createPool(payload: CreatePoolPayload): Promise<{ success: boolean; message: string; allocation?: PoolAllocations[] }>;
  getPool(poolId: string): Promise<Pool | null>;
}
