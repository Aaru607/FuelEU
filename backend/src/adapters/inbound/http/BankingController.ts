import { Request, Response } from 'express';
import { BankSurplusUseCase } from '../../../core/application';
import { BankRepository, ComplianceRepository } from '../../outbound/postgres';

/**
 * Inbound HTTP Adapter: Banking Controller
 * Handles POST requests for banking (surplus carryover) operations.
 */
export class BankingController {
  private useCase: BankSurplusUseCase;

  constructor() {
    const bankRepository = new BankRepository();
    const complianceRepository = new ComplianceRepository();
    this.useCase = new BankSurplusUseCase(bankRepository, complianceRepository);
  }

  async bankSurplus(req: Request, res: Response): Promise<Response> {
    try {
      const {
        routeId,
        fuelConsumption,
        actualIntensity,
        amountToBan,
        target,
        period,
      } = req.body as {
        routeId?: string;
        fuelConsumption?: number;
        actualIntensity?: number;
        amountToBan?: number;
        target?: number;
        period?: string;
      };

      if (
        !routeId ||
        fuelConsumption === undefined ||
        actualIntensity === undefined ||
        amountToBan === undefined ||
        !period
      ) {
        return res.status(400).json({
          error:
            'Missing required fields: routeId, fuelConsumption, actualIntensity, amountToBan, period',
        });
      }

      const result = await this.useCase.execute({
        routeId,
        fuelConsumption,
        actualIntensity,
        amountToBan,
        target,
        period,
      });

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      return res.status(400).json({ error: message });
    }
  }
}
