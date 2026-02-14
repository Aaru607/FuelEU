import { IRouteRepository } from '../ports';
import { percentDifference, TARGET_INTENSITY_2025 } from '../domain';

/**
 * Application Use Case: CalculateRouteComparison
 * 
 * Fetches the baseline intensity for a route and compares it with an actual intensity,
 * calculating the percent difference and determining compliance.
 * 
 * Dependencies: IRouteRepository, domain math
 */
export class CalculateRouteComparisonUseCase {
  constructor(private routeRepository: IRouteRepository) {}

  /**
   * Execute the use case.
   * @param input - { routeId, actualIntensity, baselineIntensity? }
   * @returns { actualIntensity, baselineIntensity, percentDifference, compliant }
   */
  async execute(input: {
    routeId: string;
    actualIntensity: number;
    baselineIntensity?: number;
  }): Promise<{
    actualIntensity: number;
    baselineIntensity: number;
    percentDifference: number;
    compliant: boolean;
  }> {
    const { routeId, actualIntensity, baselineIntensity } = input;

    // If baseline not provided, fetch from repository
    let baseline = baselineIntensity;
    if (baseline === undefined) {
      const route = await this.routeRepository.getRouteById(routeId);
      if (!route) {
        throw new Error(`Route not found: ${routeId}`);
      }
      // Default to target intensity if no explicit baseline stored
      baseline = TARGET_INTENSITY_2025;
    }

    // Calculate percent difference using pure domain math
    const pctDiff = percentDifference(actualIntensity, baseline);

    // Compliance: actual intensity must be <= target (i.e., reduction from baseline)
    const compliant = actualIntensity <= baseline;

    return {
      actualIntensity,
      baselineIntensity: baseline,
      percentDifference: pctDiff,
      compliant,
    };
  }
}
