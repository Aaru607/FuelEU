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

  it('requires input validation - empty routeIds', async () => {
    const result = await useCase.execute({
      poolId: 'pool-1',
      poolName: 'Empty Pool',
      routeIds: [],
      period: '2025',
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/at least one/i);
    expect(mockPoolRepository.createPool).not.toHaveBeenCalled();
  });

  it('fails if no compliance records found in database', async () => {
    // This test will fail because the database lookup will actually execute
    // and won't find records with these fake IDs.
    // In integration testing, this would be verified by actually inserting test data.
    
    const result = await useCase.execute({
      poolId: 'pool-1',
      poolName: 'Test Pool',
      routeIds: ['nonexistent-route-1', 'nonexistent-route-2'],
      period: '2025',
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/No compliance records found/i);
    expect(mockPoolRepository.createPool).not.toHaveBeenCalled();
  });

  // Integration tests with real database would go here
  // The use case now queries the real database directly using raw SQL
});
