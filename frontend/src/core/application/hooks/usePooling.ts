import { useState } from 'react';
import { PoolAllocations, CreatePoolPayload } from '../../ports';
import { HttpApiClient } from '../../../adapters/infrastructure';

/**
 * Custom Hook: usePooling
 * Manages pool creation operation state
 * Handles loading, error, and result states
 */
export function usePooling(apiClient: HttpApiClient) {
  const [allocation, setAllocation] = useState<PoolAllocations[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createPool = async (
    payload: CreatePoolPayload
  ): Promise<{ success: boolean; allocation?: PoolAllocations[] }> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const response = await apiClient.createPool(payload);

      if (response.success && response.allocation) {
        setAllocation(response.allocation);
        setSuccess(true);
      } else {
        throw new Error(response.message || 'Pool creation failed');
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create pool';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAllocation(null);
    setError(null);
    setSuccess(false);
  };

  return { allocation, loading, error, success, createPool, reset };
}
