import { useState } from 'react';
import { PoolAllocations, CreatePoolPayload } from '../../core/ports';

interface PoolingTabProps {
  loading: boolean;
  error: string | null;
  success: boolean;
  allocation: PoolAllocations[] | null;
  onCreatePool: (payload: CreatePoolPayload) => Promise<void>;
}

/**
 * UI Component: PoolingTab
 * Manages pool creation with member selection and result display
 * Shows before/after compliance balance per member
 * Tailwind styling: Slate form, Emerald success, red/yellow warnings
 */
export function PoolingTab({
  loading,
  error,
  success,
  allocation,
  onCreatePool,
}: PoolingTabProps) {
  const [formData, setFormData] = useState<{
    routeIds: string[];
    name: string;
    period: string;
  }>({
    routeIds: [],
    name: '',
    period: '2025', // Default to 2025 compliance period
  });

  const [inputRouteId, setInputRouteId] = useState('');

  const handleAddRoute = () => {
    if (inputRouteId.trim() && !formData.routeIds.includes(inputRouteId)) {
      setFormData((prev) => ({
        ...prev,
        routeIds: [...prev.routeIds, inputRouteId],
      }));
      setInputRouteId('');
    }
  };

  const handleRemoveRoute = (routeId: string) => {
    setFormData((prev) => ({
      ...prev,
      routeIds: prev.routeIds.filter((id) => id !== routeId),
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.routeIds.length < 2) {
      alert('Pool must contain at least 2 routes');
      return;
    }

    const payload: CreatePoolPayload = {
      poolId: `pool-${Date.now()}`,
      poolName: formData.name || `Pool ${Date.now()}`,
      routeIds: formData.routeIds,
      period: formData.period,
    };

    await onCreatePool(payload);
  };

  const poolSum =
    allocation?.reduce(
      (sum, alloc) => sum + alloc.afterComplianceBalance,
      0
    ) || 0;

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        {/* Pool Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Pool Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g., Nordic Routes Pool 2025"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            disabled={loading}
          />
        </div>

        {/* Compliance Period */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Compliance Period
          </label>
          <input
            type="text"
            value={formData.period}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                period: e.target.value,
              }))
            }
            placeholder="e.g., 2025"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">
            Pool members must have compliance records for this period
          </p>
        </div>

        {/* Route ID Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Add Routes to Pool
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputRouteId}
              onChange={(e) => setInputRouteId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRoute();
                }
              }}
              placeholder="Enter route ID and press Enter"
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddRoute}
              disabled={loading || !inputRouteId.trim()}
              className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected Routes */}
        {formData.routeIds.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Routes in Pool ({formData.routeIds.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.routeIds.map((routeId) => (
                <div
                  key={routeId}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-800 rounded-full"
                >
                  <span className="text-sm font-medium">{routeId}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRoute(routeId)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || formData.routeIds.length < 2}
          className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            formData.routeIds.length >= 2
              ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          {loading ? 'Creating Pool...' : 'Create Pool'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm font-medium text-emerald-800">
            ✓ Pool created successfully!
          </p>
        </div>
      )}

      {/* Allocation Results */}
      {allocation && allocation.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">
            Compliance Allocation
          </h3>

          {/* Pool Sum Indicator */}
          <div
            className={`p-4 rounded-lg border-2 ${
              poolSum >= 0
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
              Total Pool Compliance Balance
            </p>
            <p
              className={`text-3xl font-bold ${
                poolSum >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {poolSum.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {poolSum >= 0
                ? '✓ Pool has positive balance'
                : '✗ Pool has negative balance'}
            </p>
          </div>

          {/* Member Allocations */}
          <div className="space-y-3">
            {allocation?.map?.((alloc, idx) => (
              <div
                key={idx}
                className="p-4 bg-white border border-slate-200 rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
              >
                <p className="font-semibold text-slate-700 dark:text-zinc-50 mb-3">
                  {alloc?.routeId || 'Unknown Route'}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      Before
                    </p>
                    <p className="text-lg font-bold text-slate-700 dark:text-zinc-50 mt-1">
                      {(alloc?.beforeComplianceBalance ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-slate-400">→</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      After
                    </p>
                    <p
                      className={`text-lg font-bold mt-1 ${
                        (alloc?.afterComplianceBalance ?? 0) >= 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {(alloc?.afterComplianceBalance ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      {formData.routeIds.length < 2 && !allocation && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <p className="text-sm text-slate-600">
            Add at least 2 routes to create a pool.
          </p>
        </div>
      )}
    </div>
  );
}
