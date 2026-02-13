import { useEffect, useState } from 'react';
import { Route } from '../../ports';
import { HttpApiClient } from '../../../adapters/infrastructure';

/**
 * Custom Hook: useRoutes
 * Fetches and manages routes data state
 * Handles loading, error, and data states
 */
export function useRoutes(apiClient: HttpApiClient) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getRoutes();
        if (isMounted) {
          setRoutes(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch routes');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRoutes();

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getRoutes();
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  return { routes, loading, error, refetch };
}
