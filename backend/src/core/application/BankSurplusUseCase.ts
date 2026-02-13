import { IBankRepository, IComplianceRepository } from '../ports';
import { complianceBalance } from '../domain';

/**
 * Application Use Case: BankSurplus
 * 
 * Validates and banks (carryover) a surplus from the current period.
 * Ensures:
 * 1. Compliance Balance is positive (surplus exists)
 * 2. Banked amount does not exceed available cumulative surplus
 * 
 * Dependencies: IBankRepository, IComplianceRepository, domain math
 */
export class BankSurplusUseCase {
  constructor(
    private bankRepository: IBankRepository,
    private complianceRepository: IComplianceRepository
  ) {}

  /**
   * Execute the use case.
   * @param input - { routeId, fuelConsumption, actualIntensity, amountToBan, target?, period }
   * @returns { success: boolean, message: string }
   */
  async execute(input: {
    routeId: string;
    fuelConsumption: number;
    actualIntensity: number;
    amountToBan: number;
    target?: number;
    period: string;
  }): Promise<{ success: boolean; message: string }> {
    const {
      routeId,
      fuelConsumption,
      actualIntensity,
      amountToBan,
      target,
      period,
    } = input;

    // Calculate compliance balance using pure domain math
    const cb = complianceBalance({
      target,
      actual: actualIntensity,
      fuelConsumption,
    });

    // Validate: CB must be positive to have surplus
    if (cb <= 0) {
      return {
        success: false,
        message: `Cannot bank surplus: Compliance Balance is ${cb} (must be > 0)`,
      };
    }

    // Validate: amount to bank must not exceed available cumulative surplus
    const totalBanked = await this.bankRepository.getTotalBanked(routeId);
    if (amountToBan > totalBanked + cb) {
      return {
        success: false,
        message: `Cannot bank ${amountToBan}: exceeds available surplus (${totalBanked + cb})`,
      };
    }

    // Save compliance balance
    await this.complianceRepository.saveComplianceBalance(
      routeId,
      cb,
      period
    );

    // Save banked entry
    await this.bankRepository.saveBankEntry(routeId, amountToBan, period);

    return {
      success: true,
      message: `Successfully banked ${amountToBan} with CB = ${cb}`,
    };
  }
}
