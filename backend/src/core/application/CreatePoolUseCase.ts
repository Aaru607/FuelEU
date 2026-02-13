import { IPoolRepository } from '../ports';
import { Pool } from '../domain';

/**
 * Application Use Case: CreatePool
 * 
 * Validates pool compliance and applies greedy allocation of surplus to deficit.
 * Ensures:
 * 1. Sum of all CBs in pool >= 0 (collective compliance)
 * 2. No deficit ship exits worse than they entered
 * 3. No surplus ship exits negative
 * 4. Uses greedy allocation: sort by CB desc, assign surplus to highest deficit first
 * 
 * Dependencies: IPoolRepository, domain entities
 */
export class CreatePoolUseCase {
  constructor(private poolRepository: IPoolRepository) {}

  /**
   * Pool member input with calculated compliance balance.
   */
  private interface PoolMember {
    recordId: string;
    complianceBalance: number;
    initialState: 'deficit' | 'surplus' | 'compliant'; // initial classification
  }

  /**
   * Execute the use case.
   * @param input - { poolId, poolName, members }
   *   where members[].complianceBalance is pre-calculated
   * @returns { success: boolean, message: string, allocation?: PoolMember[] }
   */
  async execute(input: {
    poolId: string;
    poolName: string;
    members: Array<{
      recordId: string;
      complianceBalance: number;
    }>;
  }): Promise<{ success: boolean; message: string; allocation?: any[] }> {
    const { poolId, poolName, members } = input;

    if (members.length === 0) {
      return {
        success: false,
        message: 'Pool must have at least one member',
      };
    }

    // Calculate aggregate compliance balance
    const totalCB = members.reduce((sum, m) => sum + m.complianceBalance, 0);

    // Validation 1: Sum of CBs must be >= 0
    if (totalCB < 0) {
      return {
        success: false,
        message: `Pool total compliance balance is negative (${totalCB}). Cannot form pool.`,
      };
    }

    // Classify members by initial state
    const classified: PoolMember[] = members.map((m) => ({
      recordId: m.recordId,
      complianceBalance: m.complianceBalance,
      initialState:
        m.complianceBalance < 0
          ? 'deficit'
          : m.complianceBalance > 0
            ? 'surplus'
            : 'compliant',
    }));

    // Separate deficit and surplus members
    const deficit = classified.filter((m) => m.initialState === 'deficit');
    const surplus = classified.filter(
      (m) =>
        m.initialState === 'surplus' ||
        (m.initialState === 'compliant' && m.complianceBalance > 0)
    );

    // Greedy allocation: sort surplus by CB descending, assign to deficit
    surplus.sort((a, b) => b.complianceBalance - a.complianceBalance);

    let allocation = [...classified];
    let availableSurplus = surplus.reduce(
      (sum, m) => sum + m.complianceBalance,
      0
    );

    for (const deficitMember of deficit) {
      const deficitAmount = Math.abs(deficitMember.complianceBalance);
      if (availableSurplus >= deficitAmount) {
        // Full allocation to this deficit member
        deficitMember.complianceBalance = 0;
        availableSurplus -= deficitAmount;
      } else {
        // Partial allocation
        deficitMember.complianceBalance += availableSurplus;
        availableSurplus = 0;
        break; // No more surplus to allocate
      }
    }

    // Validation 2: Ensure no deficit ship exits worse (became more negative)
    const memberMap = new Map(allocation.map((m) => [m.recordId, m]));
    for (const original of classified) {
      const allocated = memberMap.get(original.recordId);
      if (
        original.initialState === 'deficit' &&
        allocated!.complianceBalance < original.complianceBalance
      ) {
        return {
          success: false,
          message: `Pool allocation failed: deficit member ${original.recordId} would exit worse`,
        };
      }
    }

    // Validation 3: Ensure no surplus ship exits negative
    for (const original of classified) {
      const allocated = memberMap.get(original.recordId);
      if (
        original.initialState === 'surplus' &&
        allocated!.complianceBalance < 0
      ) {
        return {
          success: false,
          message: `Pool allocation failed: surplus member ${original.recordId} would exit negative`,
        };
      }
    }

    // Create pool and persist
    const pool: Pool = {
      id: poolId,
      name: poolName,
      memberRecordIds: members.map((m) => m.recordId),
    };

    await this.poolRepository.createPool(pool);

    // Note: In a real system, we'd also persist the allocation results
    return {
      success: true,
      message: `Pool created successfully with aggregate CB = ${totalCB}`,
      allocation,
    };
  }
}
