import { Pool } from '../domain';

/**
 * Outbound Port: Repository interface for Pool management.
 * Implementations reside in infrastructure/adapters, not here.
 */
export interface IPoolRepository {
  /**
   * Create a new pool.
   * @param pool - Pool entity to persist
   */
  createPool(pool: Pool): Promise<void>;

  /**
   * Add a compliance record to a pool.
   * @param poolId - pool identifier
   * @param recordId - compliance record identifier
   */
  addPoolMember(poolId: string, recordId: string): Promise<void>;

  /**
   * Retrieve a pool by ID.
   * @param poolId - pool identifier
   * @returns Pool or null if not found
   */
  getPool(poolId: string): Promise<Pool | null>;
}
