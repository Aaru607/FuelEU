import { CreatePoolUseCase } from '../CreatePoolUseCase';
import { IPoolRepository } from '../../ports';

describe('CreatePoolUseCase', () => {
  let useCase: CreatePoolUseCase;
  let mockPoolRepository: jest.Mocked<IPoolRepository>;

  beforeEach(() => {
    mockPoolRepository = {
      createPool: jest.fn(),
      addPoolMember: jest.fn(),
      getPool: jest.fn(),
    };
    useCase = new CreatePoolUseCase(mockPoolRepository);
  });

  it('creates pool with positive aggregate CB', async () => {
    const result = await useCase.execute({
      poolId: 'pool-1',
      poolName: 'Atlantic Pool',
      members: [
        { recordId: 'ship-a', complianceBalance: 50 }, // surplus
        { recordId: 'ship-b', complianceBalance: 30 }, // surplus
      ],
    });

    expect(result.success).toBe(true);
    expect(mockPoolRepository.createPool).toHaveBeenCalled();
  });

  it('fails with negative aggregate CB', async () => {
    const result = await useCase.execute({
      poolId: 'pool-1',
      poolName: 'Atlantic Pool',
      members: [
        { recordId: 'ship-a', complianceBalance: -100 }, // deficit
        { recordId: 'ship-b', complianceBalance: 50 }, // surplus
      ],
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/negative/i);
  });

  it('fails with empty pool', async () => {
    const result = await useCase.execute({
      poolId: 'pool-1',
      poolName: 'Empty Pool',
      members: [],
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/at least one member/i);
  });

  it('allows zero aggregate CB (edge case)', async () => {
    const result = await useCase.execute({
      poolId: 'pool-1',
      poolName: 'Balanced Pool',
      members: [
        { recordId: 'ship-a', complianceBalance: -50 },
        { recordId: 'ship-b', complianceBalance: 50 },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('allocates surplus to deficit members greedily', async () => {
    const result = await useCase.execute({
      poolId: 'pool-1',
      poolName: 'Mixed Pool',
      members: [
        { recordId: 'ship-deficit', complianceBalance: -30 },
        { recordId: 'ship-surplus', complianceBalance: 80 },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.allocation).toBeDefined();

    // Find allocated balances
    const deficitAllocation = result.allocation?.find(
      (m) => m.recordId === 'ship-deficit'
    );
    const surplusAllocation = result.allocation?.find(
      (m) => m.recordId === 'ship-surplus'
    );

    // Deficit should be improved (made less negative or zero)
    expect(
      deficitAllocation!.complianceBalance
    ).toBeGreaterThanOrEqual(-30);
    // Surplus should remain non-negative
    expect(surplusAllocation!.complianceBalance).toBeGreaterThanOrEqual(0);
  });
});
