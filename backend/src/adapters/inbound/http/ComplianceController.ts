import { Request, Response } from 'express';
import { CalculateRouteComparisonUseCase } from '../../../core/application';
import { RouteRepository } from '../../outbound/postgres';

/**
 * Inbound HTTP Adapter: Compliance Controller
 * Handles POST requests for route compliance calculations.
 */
export class ComplianceController {
  private useCase: CalculateRouteComparisonUseCase;

  constructor() {
    const routeRepository = new RouteRepository();
    this.useCase = new CalculateRouteComparisonUseCase(routeRepository);
  }

  async calculateComparison(req: Request, res: Response): Promise<Response> {
    try {
      const { routeId, actualIntensity, baselineIntensity } = req.body as {
        routeId?: string;
        actualIntensity?: number;
        baselineIntensity?: number;
      };

      if (!routeId || actualIntensity === undefined) {
        return res.status(400).json({
          error:
            'Missing required fields: routeId, actualIntensity',
        });
      }

      const result = await this.useCase.execute({
        routeId,
        actualIntensity,
        baselineIntensity,
      });

      return res.status(200).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      return res.status(400).json({ error: message });
    }
  }
}
