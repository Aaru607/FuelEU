import { IPoolRepository } from '../../../core/ports';
import { Pool } from '../../../core/domain';
import { query } from '../../../infrastructure/db/db';

interface PoolRow {
  id: string;
  name: string;
}

interface PoolMemberRow {
  record_id: string;
}

/**
 * Concrete implementation of IPoolRepository using PostgreSQL.
 */
export class PoolRepository implements IPoolRepository {
  async createPool(pool: Pool): Promise<void> {
    await query(
      'INSERT INTO pools (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
      [pool.id, pool.name]
    );
  }

  async addPoolMember(poolId: string, recordId: string): Promise<void> {
    await query(
      'INSERT INTO pool_members (pool_id, record_id) VALUES ($1, $2) ON CONFLICT (pool_id, record_id) DO NOTHING',
      [poolId, recordId]
    );
  }

  async getPool(poolId: string): Promise<Pool | null> {
    const result = await query<PoolRow>(
      'SELECT id, name FROM pools WHERE id = $1',
      [poolId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const poolRow = result.rows[0];
    const memberResult = await query<PoolMemberRow>(
      'SELECT record_id FROM pool_members WHERE pool_id = $1',
      [poolId]
    );

    return {
      id: poolRow.id,
      name: poolRow.name,
      memberRecordIds: memberResult.rows.map((r: PoolMemberRow) => r.record_id),
    };
  }
}
