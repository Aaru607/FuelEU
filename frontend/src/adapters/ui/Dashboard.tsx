import { useState } from 'react';
import { HttpApiClient } from '../../adapters/infrastructure';
import {
  useRoutes,
  useBanking,
  usePooling,
} from '../../core/application/hooks';
import { RoutesTab } from './RoutesTab';
import { CompareTab } from './CompareTab';
import { BankingTab } from './BankingTab';
import { PoolingTab } from './PoolingTab';

type TabType = 'routes' | 'compare' | 'banking' | 'pooling';

/**
 * UI Component: Dashboard
 * Main container with 4 navigation tabs and state management
 * Professional header with Slate/Emerald color palette
 */
export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('routes');
  const [baseline, setBaseline] = useState<{ routeId: string; intensity: number } | null>(null);

  // Initialize API client
  const apiClient = new HttpApiClient('http://localhost:3000');

  // Hooks
  const { routes, loading: routesLoading, error: routesError } = useRoutes(apiClient);
  const { result: bankingResult, loading: bankingLoading, error: bankingError, bankSurplus } = useBanking(apiClient);
  const { allocation, loading: poolingLoading, error: poolingError, success: poolingSuccess, createPool } = usePooling(apiClient);

  const handleSetBaseline = (routeId: string, baseline: number) => {
    setBaseline({ routeId, intensity: baseline });
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">FuelEU Dashboard</h1>
            <p className="text-sm text-slate-600 mt-2">
              Compliance tracking, banking, and pooling management
            </p>
          </div>

          {/* Tab Navigation */}
          <nav className="flex gap-1">
            {[
              { id: 'routes', label: 'Routes', icon: '📍' },
              { id: 'compare', label: 'Compare', icon: '📊' },
              { id: 'banking', label: 'Banking', icon: '💰' },
              { id: 'pooling', label: 'Pooling', icon: '🤝' },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`px-6 py-3 font-semibold text-sm transition-all rounded-t-lg ${
                  activeTab === id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Available Routes</h2>
              {routesLoading && (
                <span className="text-sm text-slate-500">Loading routes...</span>
              )}
            </div>
            {routesError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">{routesError}</p>
              </div>
            )}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <RoutesTab routes={routes} onSetBaseline={handleSetBaseline} />
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Compliance Comparison
              {baseline && (
                <span className="text-sm font-normal text-slate-600 ml-4">
                  Baseline: {baseline.routeId} ({baseline.intensity.toFixed(2)} gCO2e/MJ)
                </span>
              )}
            </h2>
            <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
              <CompareTab comparisons={[]} />
            </div>
          </div>
        )}

        {/* Banking Tab */}
        {activeTab === 'banking' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Banking Operations</h2>
            <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
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
            <h2 className="text-2xl font-bold text-slate-900">Pool Management</h2>
            <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
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
      <footer className="border-t border-slate-200 bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-600">
          <p>FuelEU Compliance System • Production Ready</p>
        </div>
      </footer>
    </div>
  );
}
