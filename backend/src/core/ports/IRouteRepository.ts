import { Route } from '../domain';

/**
 * Outbound Port: Repository interface for Route persistence and baseline intensity management.
 * Implementations reside in infrastructure/adapters, not here.
 */
export interface IRouteRepository {
  /**
   * Retrieve all routes in scope.
   */
  getAllRoutes(): Promise<Route[]>;

  /**
   * Get a specific route by ID.
   */
  getRouteById(id: string): Promise<Route | null>;

  /**
   * Update the baseline intensity (target) for a route in the compliance period.
   * @param routeId - route identifier
   * @param baselineIntensity - new baseline intensity in gCO2e/MJ
   */
  updateBaseline(routeId: string, baselineIntensity: number): Promise<void>;
}
