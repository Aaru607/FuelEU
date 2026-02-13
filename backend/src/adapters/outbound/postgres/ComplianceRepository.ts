import { IComplianceRepository } from '../../../core/ports';
import { query } from '../../../infrastructure/db/db';

interface ComplianceRow {
  balance: number;
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
      'SELECT actual_intensity as balance FROM ship_compliance WHERE route_id = $1 AND period = $2',
      [routeId, period]
    );
    return result.rows.length > 0 ? result.rows[0].balance : null;
  }
}
