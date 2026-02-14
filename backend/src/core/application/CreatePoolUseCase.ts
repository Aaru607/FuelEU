import { IPoolRepository } from '../ports';
import { Pool } from '../domain';
import { complianceBalance } from '../domain/math';
import { getPool } from '../../infrastructure/db/db';

// Pool member with calculated compliance balance (before and after)
interface PoolMember {
  recordId: string;
  beforeComplianceBalance: number;
  afterComplianceBalance: number;
  initialState: 'deficit' | 'surplus' | 'compliant'; // initial classification
}

/**
 * Application Use Case: CreatePool
 * 
 * CRITICAL: Backend is the source of truth, not the frontend.
 * 
 * Process:
 * 1. Accept route IDs from the frontend (ignore any client-provided balances)
 * 2. Query the database directly with RAW SQL for REAL fuel_consumption and actual_intensity
 * 3. Calculate the TRUE compliance balance using domain math: (target - actual) * energy_in_scope
 * 4. Apply greedy allocation: sort by CB desc, assign surplus to deficit members
 * 5. Validate pool compliance constraints
 * 
 * Dependencies: getPool (direct database access), domain math
 */
export class CreatePoolUseCase {
  constructor(
    private poolRepository: IPoolRepository
  ) {}

  /**
   * Execute the use case.
   * @param input - { poolId, poolName, routeIds, period }
   *   Frontend-provided complianceBalance values are IGNORED
   * @returns { success: boolean, message: string, allocation?: Array<{ recordId, beforeComplianceBalance, afterComplianceBalance }> }
   */
  async execute(input: {
    poolId: string;
    poolName: string;
    routeIds: string[];
    period: string;
  }): Promise<{
    success: boolean;
    message: string;
    allocation?: Array<{
      recordId: string;
      beforeComplianceBalance: number;
      afterComplianceBalance: number;
    }>;
  }> {
    const { poolId, poolName, routeIds, period } = input;

    if (routeIds.length === 0) {
      return {
        success: false,
        message: 'Pool must have at least one route member',
      };
    }

    // Step 1: Fetch REAL compliance data directly from database using RAW SQL
    console.log(`\n[CreatePoolUseCase] Executing raw SQL query for routes: ${routeIds.join(', ')}`);
    console.log(`[CreatePoolUseCase] Period: ${period}`);
    
    const db = getPool();
    const sqlQuery = `
      SELECT route_id, fuel_consumption, actual_intensity 
      FROM ship_compliance 
      WHERE route_id = ANY($1) AND period = $2
      ORDER BY route_id
    `;
    console.log(`[CreatePoolUseCase] SQL: ${sqlQuery.replace(/\s+/g, ' ')}`);
    console.log(`[CreatePoolUseCase] Parameters: routeIds=$${JSON.stringify(routeIds)}, period=$${period}`);

    let complianceRecords: Array<{ route_id: string; fuel_consumption: string | number; actual_intensity: string | number }>;
    try {
      const result = await db.query(sqlQuery, [routeIds, period]);
      complianceRecords = result.rows;
      console.log(`[CreatePoolUseCase] ✓ Raw SQL result (${result.rows.length} rows):`);
      console.table(result.rows);
    } catch (error) {
      console.error(`[CreatePoolUseCase] ✗ SQL query failed:`, error);
      return {
        success: false,
        message: `Database query failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      };
    }

    if (complianceRecords.length === 0) {
      return {
        success: false,
        message: `No compliance records found in ship_compliance table for routes: ${routeIds.join(', ')} in period ${period}`,
      };
    }

    // Step 2: Calculate REAL compliance balance for each route
    const members: PoolMember[] = [];
    for (const record of complianceRecords) {
      const fuelConsumption = parseFloat(String(record.fuel_consumption));
      const actualIntensity = parseFloat(String(record.actual_intensity));
      
      console.log(`[CreatePoolUseCase] Route ${record.route_id}: fuelConsumption=${fuelConsumption}, actualIntensity=${actualIntensity}`);

      const calculatedCB = complianceBalance({
        target: undefined, // Uses domain's default TARGET_INTENSITY_2025
        actual: actualIntensity,
        fuelConsumption: fuelConsumption,
      });

      console.log(`[CreatePoolUseCase] Route ${record.route_id}: calculated compliance balance = ${calculatedCB.toFixed(2)}`);

      // Step 3: Classify by initial state
      const initialState: 'deficit' | 'surplus' | 'compliant' =
        calculatedCB < 0 ? 'deficit' : calculatedCB > 0 ? 'surplus' : 'compliant';

      members.push({
        recordId: record.route_id,
        beforeComplianceBalance: calculatedCB,
        afterComplianceBalance: calculatedCB,
        initialState,
      });
    }

    // Step 4: Calculate aggregate compliance balance
    const totalCB = members.reduce((sum: number, m) => sum + m.beforeComplianceBalance, 0);
    console.log(`[CreatePoolUseCase] Total pool compliance balance: ${totalCB.toFixed(2)}`);

    // Validation 1: Sum of CBs must be >= 0
    if (totalCB < 0) {
      return {
        success: false,
        message: `Pool total compliance balance is negative (${totalCB.toFixed(2)}). Cannot form pool.`,
      };
    }

    // Step 5: Apply greedy allocation of surplus to deficit
    const deficit = members.filter((m) => m.initialState === 'deficit');
    const surplus = members.filter(
      (m) =>
        m.initialState === 'surplus' ||
        (m.initialState === 'compliant' && m.afterComplianceBalance > 0)
    );

    // Greedy allocation: sort surplus by CB descending, assign to deficit
    surplus.sort((a, b) => b.afterComplianceBalance - a.afterComplianceBalance);

    let allocation = [...members];
    let availableSurplus = surplus.reduce(
      (sum, m) => sum + m.afterComplianceBalance,
      0
    );

    for (const deficitMember of deficit) {
      const deficitAmount = Math.abs(deficitMember.afterComplianceBalance);
      if (availableSurplus >= deficitAmount) {
        // Full allocation to this deficit member
        deficitMember.afterComplianceBalance = 0;
        availableSurplus -= deficitAmount;
      } else {
        // Partial allocation
        deficitMember.afterComplianceBalance += availableSurplus;
        availableSurplus = 0;
        break; // No more surplus to allocate
      }
    }

    // Validation 2: Ensure no deficit ship exits worse (became more negative)
    const memberMap = new Map(allocation.map((m) => [m.recordId, m]));
    for (const original of members) {
      const allocated = memberMap.get(original.recordId);
      if (
        original.initialState === 'deficit' &&
        allocated!.afterComplianceBalance < original.beforeComplianceBalance
      ) {
        return {
          success: false,
          message: `Pool allocation failed: deficit member ${original.recordId} would exit worse`,
        };
      }
    }

    // Validation 3: Ensure no surplus ship exits negative
    for (const original of members) {
      const allocated = memberMap.get(original.recordId);
      if (
        original.initialState === 'surplus' &&
        allocated!.afterComplianceBalance < 0
      ) {
        return {
          success: false,
          message: `Pool allocation failed: surplus member ${original.recordId} would exit negative`,
        };
      }
    }

    // Step 6: Create pool and persist
    const pool: Pool = {
      id: poolId,
      name: poolName,
      memberRecordIds: routeIds,
    };

    await this.poolRepository.createPool(pool);

    // Return calculated allocation with real compliance balances
    return {
      success: true,
      message: `Pool created successfully with aggregate CB = ${totalCB.toFixed(2)}. All values calculated from database.`,
      allocation: allocation.map((m) => ({
        recordId: m.recordId,
        beforeComplianceBalance: m.beforeComplianceBalance,
        afterComplianceBalance: m.afterComplianceBalance,
      })),
    };
  }
}
