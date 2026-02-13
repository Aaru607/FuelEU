import { useState } from 'react';
import { BankingResult } from '../../ports';
import { HttpApiClient } from '../../../adapters/infrastructure';

interface BankingParams {
  routeId: string;
  fuelConsumption: number;
  actualIntensity: number;
  amountToBan: number;
  target?: number;
  period: string;
}

/**
 * Custom Hook: useBanking
 * Manages banking operation state
 * Handles loading, error, and result states
 */
export function useBanking(apiClient: HttpApiClient) {
  const [result, setResult] = useState<BankingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bankSurplus = async (params: BankingParams): Promise<BankingResult> => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.bankSurplus(params);
      setResult(data);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to bank surplus';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, bankSurplus, reset };
}
