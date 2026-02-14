import { ComplianceComparison, Route } from '../../core/ports';

interface CompareTabProps {
  comparisons: ComplianceComparison[];
  routes?: Route[];
}

/**
 * UI Component: CompareTab
 * Displays compliance comparison results with visual progress bars
 * Uses CSS width percentages instead of chart libraries
 * Tailwind styling: Slate body, Emerald for compliant, red for non-compliant
 */
export function CompareTab({ comparisons, routes = [] }: CompareTabProps) {
  return (
    <div className="space-y-6">
      {comparisons.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No comparisons yet. Set a baseline from the Routes tab.
        </div>
      )}

      {comparisons.map((comp, idx) => {
        const route = routes[idx];
        return (
          <div key={idx} className="card p-6">
            {route && (
              <div className="mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Route
                </p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                  {route.id} ({route.origin} → {route.destination})
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Actual Intensity
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
                  {(comp.actualIntensity ?? 0).toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">gCO2e/MJ</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Baseline Intensity
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
                  {(comp.baselineIntensity ?? 0).toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">gCO2e/MJ</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Difference
                </p>
                <p className={`text-2xl font-bold mt-2 ${(comp.percentDifference ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(comp.percentDifference ?? 0).toFixed(1)}%
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {(comp.percentDifference ?? 0) >= 0 ? 'Improvement' : 'Deterioration'}
                </p>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Compliance Status
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    comp.compliant
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {comp.compliant ? '✓ Compliant' : '✗ Non-Compliant'}
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${(comp.compliant ?? false) ? 'bg-emerald-400' : 'bg-red-400'}`}
                  style={{
                    width: `${Math.min(
                      Math.max(
                        (((comp.actualIntensity ?? 0) / ((comp.baselineIntensity ?? 100) * 1.2)) * 100) || 0,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
