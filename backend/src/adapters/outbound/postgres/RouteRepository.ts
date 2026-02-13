import { IRouteRepository } from '../../../core/ports';
import { Route } from '../../../core/domain';
import { query } from '../../../infrastructure/db/db';

interface RouteRow {
  id: string;
  origin: string;
  destination: string;
  distanceKm?: number;
}

/**
 * Concrete implementation of IRouteRepository using PostgreSQL.
 */
export class RouteRepository implements IRouteRepository {
  async getAllRoutes(): Promise<Route[]> {
    const result = await query<RouteRow>(
      'SELECT id, origin, destination, distance_km as "distanceKm" FROM routes ORDER BY id'
    );
    return result.rows.map((row: RouteRow): Route => ({
      id: row.id,
      origin: row.origin,
      destination: row.destination,
      distanceKm: row.distanceKm,
    }));
  }

  async getRouteById(id: string): Promise<Route | null> {
    const result = await query<RouteRow>(
      'SELECT id, origin, destination, distance_km as "distanceKm" FROM routes WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return {
      id: row.id,
      origin: row.origin,
      destination: row.destination,
      distanceKm: row.distanceKm,
    };
  }

  async updateBaseline(routeId: string, baselineIntensity: number): Promise<void> {
    // Note: In a real system, we might store baseline per route or per period.
    // For now, this is a placeholder that validates the route exists.
    const result = await query<{ id: string }>(
      'SELECT id FROM routes WHERE id = $1',
      [routeId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Route not found: ${routeId}`);
    }
    // Could store baseline in a separate table or route metadata column
    // For this MVP, the domain uses the constant TARGET_INTENSITY_2025
  }
}
