import { IRouteRepository } from '../../../core/ports';
import { Route } from '../../../core/domain';
import { query } from '../../../infrastructure/db/db';

interface RouteRow {
  id: string;
  origin: string;
  destination: string;
  distance_km?: number;
  actual_intensity?: number;
}

/**
 * Concrete implementation of IRouteRepository using PostgreSQL.
 */
export class RouteRepository implements IRouteRepository {
  async getAllRoutes(): Promise<Route[]> {
    // Join with ship_compliance to get the latest actual_intensity
    const result = await query<RouteRow>(
      `SELECT
        r.id,
        r.origin,
        r.destination,
        r.distance_km,
        sc.actual_intensity
      FROM routes r
      LEFT JOIN ship_compliance sc ON r.id = sc.route_id AND sc.period = '2025'
      ORDER BY r.id`
    );
    
    return result.rows.map((row: RouteRow): Route => {
      // Parse numeric fields from PostgreSQL (pg driver returns NUMERIC as strings)
      const distanceKm = row.distance_km ? parseFloat(String(row.distance_km)) : undefined;
      const actualIntensity = row.actual_intensity ? parseFloat(String(row.actual_intensity)) : undefined;
      
      // eslint-disable-next-line no-console
      console.log(`[RouteRepository] Mapped row ${row.id}:`, { distanceKm, actualIntensity });
      
      return {
        id: row.id,
        origin: row.origin,
        destination: row.destination,
        distanceKm,
        actualIntensity: actualIntensity && actualIntensity > 0 ? actualIntensity : undefined,
      };
    });
  }

  async getRouteById(id: string): Promise<Route | null> {
    const result = await query<RouteRow>(
      `SELECT
        r.id,
        r.origin,
        r.destination,
        r.distance_km,
        sc.actual_intensity
      FROM routes r
      LEFT JOIN ship_compliance sc ON r.id = sc.route_id AND sc.period = '2025'
      WHERE r.id = $1
      LIMIT 1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    
    // Parse numeric fields from PostgreSQL (pg driver returns NUMERIC as strings)
    const distanceKm = row.distance_km ? parseFloat(String(row.distance_km)) : undefined;
    const actualIntensity = row.actual_intensity ? parseFloat(String(row.actual_intensity)) : undefined;
    
    // eslint-disable-next-line no-console
    console.log(`[RouteRepository] GetById ${id}:`, { distanceKm, actualIntensity });
    
    return {
      id: row.id,
      origin: row.origin,
      destination: row.destination,
      distanceKm,
      actualIntensity: actualIntensity && actualIntensity > 0 ? actualIntensity : undefined,
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
