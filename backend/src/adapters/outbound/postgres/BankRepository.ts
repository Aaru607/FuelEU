import { IBankRepository } from '../../../core/ports';
import { query } from '../../../infrastructure/db/db';

interface BankTotalRow {
  total: string | null;
}

/**
 * Concrete implementation of IBankRepository using PostgreSQL.
 */
export class BankRepository implements IBankRepository {
  async saveBankEntry(
    routeId: string,
    amount: number,
    period: string
  ): Promise<void> {
    await query(
      'INSERT INTO bank_entries (route_id, amount, period) VALUES ($1, $2, $3)',
      [routeId, amount, period]
    );
  }

  async getTotalBanked(routeId: string): Promise<number> {
    const result = await query<BankTotalRow>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM bank_entries WHERE route_id = $1',
      [routeId]
    );
    const total = result.rows[0]?.total;
    // Parse numeric field from PostgreSQL (pg driver returns NUMERIC as strings)
    return total ? parseFloat(String(total)) : 0;
  }
}
