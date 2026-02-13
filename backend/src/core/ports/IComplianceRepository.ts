/**
 * Outbound Port: Repository interface for Compliance Balance persistence.
 * Implementations reside in infrastructure/adapters, not here.
 */
export interface IComplianceRepository {
  /**
   * Persist a compliance balance result.
   * @param routeId - route identifier
   * @param balance - compliance balance value (CB)
   * @param period - compliance period (e.g., "2025")
   */
  saveComplianceBalance(
    routeId: string,
    balance: number,
    period: string
  ): Promise<void>;

  /**
   * Retrieve a saved compliance balance for a route in a given period.
   * @param routeId - route identifier
   * @param period - compliance period
   * @returns Compliance balance or null if not found
   */
  getComplianceBalance(
    routeId: string,
    period: string
  ): Promise<number | null>;
}
