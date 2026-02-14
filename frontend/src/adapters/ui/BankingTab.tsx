import { useState } from 'react';
import { BankingResult } from '../../core/ports';

interface BankingTabProps {
  loading: boolean;
  error: string | null;
  result: BankingResult | null;
  onBankSurplus: (params: {
    routeId: string;
    fuelConsumption: number;
    actualIntensity: number;
    amountToBan: number;
    period: string;
  }) => Promise<void>;
}

/**
 * UI Component: BankingTab
 * Manages banking operations with form inputs and result display
 * Tailwind styling: Slate form elements, Emerald buttons, red warnings
 */
export function BankingTab({
  loading,
  error,
  result,
  onBankSurplus,
}: BankingTabProps) {
  const [formData, setFormData] = useState({
    routeId: '',
    fuelConsumption: 0,
    actualIntensity: 0,
    amountToBan: 0,
    period: '2025',
  });

const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Treat routeId and period as strings, don't parse them!
    if (name === 'routeId' || name === 'period') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // Treat everything else (fuel, intensity, amount) as numbers
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : Math.max(0, numValue),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onBankSurplus(formData);
  };

  const complianceBalance = result?.complianceBalance || 0;
  const canBank = complianceBalance > 0;

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        {/* Route ID */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Route ID
          </label>
          <input
            type="text"
            name="routeId"
            value={formData.routeId}
            onChange={handleChange}
            placeholder="e.g., route-001"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            disabled={loading}
          />
        </div>

        {/* Fuel Consumption */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Fuel Consumption (MJ)
          </label>
          <input
            type="number"
            name="fuelConsumption"
            value={formData.fuelConsumption}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            disabled={loading}
          />
        </div>

        {/* Actual Intensity */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Actual Intensity (gCO2e/MJ)
          </label>
          <input
            type="number"
            name="actualIntensity"
            value={formData.actualIntensity}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            disabled={loading}
          />
        </div>

        {/* Amount to Bank */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Amount to Bank (gCO2e)
          </label>
          <input
            type="number"
            name="amountToBan"
            value={formData.amountToBan}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            disabled={loading}
          />
        </div>

        {/* Period */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Period
          </label>
          <select
            name="period"
            value={formData.period}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
            disabled={loading}
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
        disabled={loading}
         className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all ${
  !loading
    ? 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer'
    : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700'
}`}
        >
          {loading ? 'Processing...' : 'Bank Surplus'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-4 p-6 card">
          <h3 className="text-lg font-semibold text-emerald-900">Banking Result</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Energy in Scope
              </p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {(result?.energyInScope ?? 0).toFixed(2)} MJ
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Amount Banked
              </p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {(result?.amountBanked ?? 0).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Compliance Balance
              </p>
              <p className={`text-xl font-bold mt-1 ${complianceBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {complianceBalance.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Status
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
                ✓ Success
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Warning */}
      {result && !canBank && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Insufficient compliance balance to bank surplus. Set a baseline with
            a better-performing route first.
          </p>
        </div>
      )}
    </div>
  );
}
