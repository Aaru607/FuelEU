import { Request, Response } from 'express';
import { CreatePoolUseCase } from '../../../core/application';
import { PoolRepository } from '../../outbound/postgres';

/**
 * Inbound HTTP Adapter: Pools Controller
 * Handles POST and GET requests for pool operations.
 * 
 * CRITICAL: Backend is the source of truth. The use case will query the database
 * directly using raw SQL to fetch REAL compliance data, ignoring any client-provided values.
 */
export class PoolsController {
  private createPoolUseCase: CreatePoolUseCase;
  private poolRepository: PoolRepository;

  constructor() {
    this.poolRepository = new PoolRepository();
    this.createPoolUseCase = new CreatePoolUseCase(this.poolRepository);
  }

  async createPool(req: Request, res: Response): Promise<Response> {
    try {
      const { poolId, poolName, routeIds, period } = req.body as {
        poolId?: string;
        poolName?: string;
        routeIds?: string[];
        period?: string;
      };

      if (!poolId || !poolName || !Array.isArray(routeIds) || routeIds.length === 0 || !period) {
        return res.status(400).json({
          error: 'Missing required fields: poolId, poolName, routeIds (non-empty array), period',
        });
      }

      const result = await this.createPoolUseCase.execute({
        poolId,
        poolName,
        routeIds,
        period,
      });

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json({
        success: result.success,
        message: result.message,
        allocation: result.allocation?.map((alloc) => ({
          routeId: alloc.recordId,
          beforeComplianceBalance: alloc.beforeComplianceBalance,
          afterComplianceBalance: alloc.afterComplianceBalance,
        })),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      return res.status(400).json({ error: message });
    }
  }

  async getPool(req: Request, res: Response): Promise<Response> {
    try {
      const { poolId } = req.params as { poolId: string };

      const pool = await this.poolRepository.getPool(poolId);

      if (!pool) {
        return res.status(404).json({ error: `Pool not found: ${poolId}` });
      }

      return res.status(200).json(pool);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      return res.status(500).json({ error: message });
    }
  }
}
