/**
 * Outbound Port: Repository interface for Banking (surplus/deficit carryover) operations.
 * Implementations reside in infrastructure/adapters, not here.
 */
export interface IBankRepository {
  /**
   * Save a banked surplus entry for a route.
   * @param routeId - route identifier
   * @param amount - amount banked (in tCO2e or relevant units)
   * @param period - compliance period
   */
  saveBankEntry(
    routeId: string,
    amount: number,
    period: string
  ): Promise<void>;

  /**
   * Retrieve the total banked (cumulative) surplus for a route across all periods.
   * @param routeId - route identifier
   * @returns Total banked amount
   */
  getTotalBanked(routeId: string): Promise<number>;
}
