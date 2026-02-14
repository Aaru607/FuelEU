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
    // eslint-disable-next-line no-console
    console.debug('[HttpApiClient] Request:', { url, method: options?.method || 'GET', headers: options?.headers });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    // eslint-disable-next-line no-console
    console.debug('[HttpApiClient] Response status:', response.status, 'url:', url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      // eslint-disable-next-line no-console
      console.error('[HttpApiClient] HTTP error', response.status, ':', error);
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const json = await response.json().catch(() => null);
    // eslint-disable-next-line no-console
    console.debug('[HttpApiClient] Response body:', json);
    return json as T;
  }

  // Routes
  async getRoutes(): Promise<Route[]> {
    // eslint-disable-next-line no-console
    console.log('[HttpApiClient] Fetching routes from', this.baseUrl);
    try {
      const data = await this.fetch<Route[]>('/routes');
      // eslint-disable-next-line no-console
      console.log('[HttpApiClient] Routes fetched successfully:', data);
      return data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[HttpApiClient] Routes fetch failed:', err);
      throw err;
    }
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
