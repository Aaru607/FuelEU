import { useState, useMemo, useEffect } from 'react';
import { HttpApiClient } from '../../adapters/infrastructure';
import { useRoutes, useBanking, usePooling } from '../../core/application/hooks';
import { RoutesTab } from './RoutesTab';
import { CompareTab } from './CompareTab';
import { BankingTab } from './BankingTab';
import { PoolingTab } from './PoolingTab';
import { Map, BarChart2, Wallet, Users, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../core/application/hooks/useTheme';
import { ComplianceComparison, Route } from '../../core/ports';

type TabType = 'routes' | 'compare' | 'banking' | 'pooling';

/**
 * UI Component: Dashboard
 * Main container with 4 navigation tabs and state management
 * Professional header with Slate/Emerald color palette
 */
export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('routes');
  const [baseline, setBaseline] = useState<{ routeId: string; intensity: number } | null>(null);
  const [comparisons, setComparisons] = useState<ComplianceComparison[]>([]);
  const [comparisonRoutes, setComparisonRoutes] = useState<Route[]>([]);
  const { theme, toggle } = useTheme();

  // Memoize API client to prevent infinite re-renders
  const apiClient = useMemo(() => new HttpApiClient('http://localhost:3000'), []);

  // Hooks
  const { routes, loading: routesLoading, error: routesError } = useRoutes(apiClient);
  const { result: bankingResult, loading: bankingLoading, error: bankingError, bankSurplus } = useBanking(apiClient);
  const { allocation, loading: poolingLoading, error: poolingError, success: poolingSuccess, createPool } = usePooling(apiClient);

  // Generate comparisons when baseline changes
  useEffect(() => {
    const generateComparisons = async () => {
      if (!baseline || routes.length === 0) {
        setComparisons([]);
        setComparisonRoutes([]);
        return;
      }

      // Validate baseline intensity
      if (!baseline.intensity || baseline.intensity <= 0) {
        // eslint-disable-next-line no-console
        console.warn('[Dashboard] Invalid baseline intensity:', baseline.intensity);
        setComparisons([]);
        setComparisonRoutes([]);
        return;
      }

      try {
        const comparisonsArray: ComplianceComparison[] = [];
        const compRoutes: Route[] = [];
        
        // Compare each non-baseline route to the baseline
        for (const route of routes) {
          if (route.id === baseline.routeId) {
            // Skip the baseline route itself
            continue;
          }

          // Only compare routes with valid intensity data
          const routeIntensity = route.actualIntensity;
          if (!routeIntensity || routeIntensity <= 0) {
            // eslint-disable-next-line no-console
            console.debug(`[Dashboard] Skipping route ${route.id} (no valid intensity data)`);
            continue;
          }

          // eslint-disable-next-line no-console
          console.log(`[Dashboard] Comparing ${route.id} (${routeIntensity}) to baseline ${baseline.routeId} (${baseline.intensity})`);

          const comparison = await apiClient.compareRoutes({
            routeId: route.id,
            actualIntensity: routeIntensity,
            baselineIntensity: baseline.intensity,
          });
          comparisonsArray.push(comparison);
          compRoutes.push(route);
        }
        
        setComparisons(comparisonsArray);
        setComparisonRoutes(compRoutes);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Dashboard] Failed to generate comparisons:', err);
        setComparisons([]);
        setComparisonRoutes([]);
      }
    };

    generateComparisons();
  }, [baseline, routes, apiClient]);

  const handleSetBaseline = (routeId: string, intensity: number) => {
    setBaseline({ routeId, intensity });
    setActiveTab('compare');
  };

  const handleBankSurplus = async (params: {
    routeId: string;
    fuelConsumption: number;
    actualIntensity: number;
    amountToBan: number;
    period: string;
  }) => {
    try {
      await bankSurplus(params);
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleCreatePool = async (payload: any) => {
    try {
      await createPool(payload);
    } catch (err) {
      // Error already handled in hook
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">FuelEU Dashboard</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Compliance tracking, banking, and pooling management
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle theme"
                onClick={toggle}
                className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation - sleek pill / bottom border style */}
          <nav className="flex gap-2 mt-4">
            {[
              { id: 'routes', label: 'Routes', Icon: Map },
              { id: 'compare', label: 'Compare', Icon: BarChart2 },
              { id: 'banking', label: 'Banking', Icon: Wallet },
              { id: 'pooling', label: 'Pooling', Icon: Users },
            ].map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-md ${
                    active
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'bg-transparent text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.5} className={`${active ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

          {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Available Routes</h2>
              {routesLoading && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading routes...</span>
              )}
            </div>
            {routesError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">{routesError}</p>
              </div>
            )}
            <div className="card overflow-hidden">
              <RoutesTab routes={routes} onSetBaseline={handleSetBaseline} />
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Compliance Comparison
              {baseline && (
                <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400 ml-4">
                  Baseline: {baseline.routeId} ({baseline.intensity.toFixed(2)} gCO2e/MJ)
                </span>
              )}
            </h2>
            <div className="card">
              <CompareTab comparisons={comparisons} routes={comparisonRoutes} />
            </div>
          </div>
        )}

        {/* Banking Tab */}
        {activeTab === 'banking' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Banking Operations</h2>
            <div className="card p-6">
              <BankingTab
                loading={bankingLoading}
                error={bankingError}
                result={bankingResult}
                onBankSurplus={handleBankSurplus}
              />
            </div>
          </div>
        )}

        {/* Pooling Tab */}
        {activeTab === 'pooling' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Pool Management</h2>
            <div className="card p-6">
              <PoolingTab
                loading={poolingLoading}
                error={poolingError}
                success={poolingSuccess}
                allocation={allocation}
                onCreatePool={handleCreatePool}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>FuelEU Compliance System • Production Ready</p>
        </div>
      </footer>
    </>
  );
}
