import { CalculateRouteComparisonUseCase } from '../CalculateRouteComparisonUseCase';
import { IRouteRepository } from '../../ports';

describe('CalculateRouteComparisonUseCase', () => {
  let useCase: CalculateRouteComparisonUseCase;
  let mockRouteRepository: jest.Mocked<IRouteRepository>;

  beforeEach(() => {
    mockRouteRepository = {
      getAllRoutes: jest.fn(),
      getRouteById: jest.fn(),
      updateBaseline: jest.fn(),
    };
    useCase = new CalculateRouteComparisonUseCase(mockRouteRepository);
  });

  it('calculates percent difference and compliant flag', async () => {
    const result = await useCase.execute({
      routeId: 'route-1',
      actualIntensity: 75,
      baselineIntensity: 90,
    });

    // (75/90 - 1) * 100 = -16.67
    expect(result.percentDifference).toBeCloseTo(-16.67, 1);
    expect(result.compliant).toBe(true); // 75 < 90
  });

  it('returns non-compliant when actual > baseline', async () => {
    const result = await useCase.execute({
      routeId: 'route-1',
      actualIntensity: 95,
      baselineIntensity: 90,
    });

    expect(result.compliant).toBe(false);
  });

  it('throws when route not found and no baseline provided', async () => {
    mockRouteRepository.getRouteById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        routeId: 'unknown-route',
        actualIntensity: 80,
      })
    ).rejects.toThrow('Route not found');
  });

  it('uses default target when baseline not provided', async () => {
    mockRouteRepository.getRouteById.mockResolvedValueOnce({
      id: 'route-1',
      origin: 'A',
      destination: 'B',
    });

    const result = await useCase.execute({
      routeId: 'route-1',
      actualIntensity: 85, // less than TARGET_INTENSITY_2025 (89.3368)
    });

    expect(result.compliant).toBe(true);
  });
});
