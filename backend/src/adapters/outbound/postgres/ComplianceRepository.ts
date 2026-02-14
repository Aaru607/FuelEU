import { IComplianceRepository } from '../../../core/ports';
import { query } from '../../../infrastructure/db/db';

interface ComplianceRow {
  actual_intensity?: number;
  fuel_consumption?: number;
}

/**
 * Concrete implementation of IComplianceRepository using PostgreSQL.
 */
export class ComplianceRepository implements IComplianceRepository {
  async saveComplianceBalance(
    routeId: string,
    balance: number,
    period: string
  ): Promise<void> {
    // Generate a unique record ID
    const recordId = `compliance-${routeId}-${period}-${Date.now()}`;

    await query(
      `INSERT INTO ship_compliance (id, route_id, fuel_consumption, actual_intensity, period)
       VALUES ($1, $2, 0, $3, $4)
       ON CONFLICT (route_id, period) DO UPDATE
       SET actual_intensity = $3`,
      [recordId, routeId, balance, period]
    );
  }

  async getComplianceBalance(
    routeId: string,
    period: string
  ): Promise<number | null> {
    const result = await query<ComplianceRow>(
      'SELECT actual_intensity FROM ship_compliance WHERE route_id = $1 AND period = $2',
      [routeId, period]
    );
    if (result.rows.length > 0 && result.rows[0].actual_intensity) {
      // Parse numeric field from PostgreSQL (pg driver returns NUMERIC as strings)
      return parseFloat(String(result.rows[0].actual_intensity));
    }
    return null;
  }

  async getComplianceRecord(
    routeId: string,
    period: string
  ): Promise<{ fuelConsumption: number; actualIntensity: number } | null> {
    const result = await query<ComplianceRow>(
      `SELECT fuel_consumption, actual_intensity 
       FROM ship_compliance 
       WHERE route_id = $1 AND period = $2
       LIMIT 1`,
      [routeId, period]
    );

    if (result.rows.length === 0 || !result.rows[0].fuel_consumption || !result.rows[0].actual_intensity) {
      return null;
    }

    const row = result.rows[0];
    return {
      fuelConsumption: parseFloat(String(row.fuel_consumption)),
      actualIntensity: parseFloat(String(row.actual_intensity)),
    };
  }
}
