import { ComplianceComparison } from '../../core/ports';

interface CompareTabProps {
  comparisons: ComplianceComparison[];
}

/**
 * UI Component: CompareTab
 * Displays compliance comparison results with visual progress bars
 * Uses CSS width percentages instead of chart libraries
 * Tailwind styling: Slate body, Emerald for compliant, red for non-compliant
 */
export function CompareTab({ comparisons }: CompareTabProps) {
  return (
    <div className="space-y-6">
      {comparisons.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No comparisons yet. Set a baseline from the Routes tab.
        </div>
      )}

      {comparisons.map((comp, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Actual Intensity
              </p>
              <p className="text-2xl font-bold text-slate-700 mt-2">
                {comp.actualIntensity.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">gCO2e/MJ</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Baseline Intensity
              </p>
              <p className="text-2xl font-bold text-slate-700 mt-2">
                {comp.baselineIntensity?.toFixed(2) || 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">gCO2e/MJ</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Difference
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  comp.percentDifference >= 0
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {comp.percentDifference.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {comp.percentDifference >= 0 ? 'Improvement' : 'Deterioration'}
              </p>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Compliance Status
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  comp.compliant
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {comp.compliant ? '✓ Compliant' : '✗ Non-Compliant'}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  comp.compliant ? 'bg-emerald-600' : 'bg-red-600'
                }`}
                style={{
                  width: `${Math.min(
                    Math.max(
                      (comp.actualIntensity /
                        ((comp.baselineIntensity || 100) * 1.2)) *
                        100,
                      0
                    ),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
