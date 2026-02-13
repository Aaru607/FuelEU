import {
  OutboundApiPort,
  Route,
  ComplianceComparison,
  BankingResult,
  Pool,
  CreatePoolPayload,
  PoolAllocations,
} from '../../core/ports';

/**
 * Infrastructure Adapter: HttpApiClient
 * Implements OutboundApiPort using native fetch (no Axios)
 * Points to http://localhost:3000
 */
export class HttpApiClient implements OutboundApiPort {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Routes
  async getRoutes(): Promise<Route[]> {
    return this.fetch<Route[]>('/routes');
  }

  async getRouteById(id: string): Promise<Route | null> {
    try {
      return await this.fetch<Route>(`/routes/${id}`);
    } catch {
      return null;
    }
  }

  // Compliance
  async compareRoutes(params: {
    routeId: string;
    actualIntensity: number;
    baselineIntensity?: number;
  }): Promise<ComplianceComparison> {
    return this.fetch<ComplianceComparison>('/compliance/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Banking
  async getBanking(routeId: string): Promise<{ totalBanked: number }> {
    // Note: Backend doesn't have a dedicated endpoint, would need to add
    // For now, return a placeholder
    try {
      const response = await fetch(`${this.baseUrl}/banking/${routeId}`).catch(
        () => null
      );
      if (response?.ok) {
        return response.json();
      }
    } catch {
      // Endpoint not available
    }
    return { totalBanked: 0 };
  }

  async bankSurplus(params: {
    routeId: string;
    fuelConsumption: number;
    actualIntensity: number;
    amountToBan: number;
    target?: number;
    period: string;
  }): Promise<BankingResult> {
    return this.fetch<BankingResult>('/banking/bank-surplus', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Pools
  async createPool(
    payload: CreatePoolPayload
  ): Promise<{
    success: boolean;
    message: string;
    allocation?: PoolAllocations[];
  }> {
    return this.fetch('/pools', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPool(poolId: string): Promise<Pool | null> {
    try {
      return await this.fetch<Pool>(`/pools/${poolId}`);
    } catch {
      return null;
    }
  }
}
