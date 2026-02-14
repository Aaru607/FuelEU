import { Route } from '../../core/ports';

interface RoutesTabProps {
  routes: Route[];
  onSetBaseline?: (routeId: string, baseline: number) => void;
}

/**
 * UI Component: RoutesTab
 * Displays all routes in a professional table with actions
 * Tailwind styling: Slate body text, Emerald accents
 */
export function RoutesTab({ routes, onSetBaseline }: RoutesTabProps) {
  return (
    <div className="overflow-x-auto card">
      <table className="w-full border-collapse rounded-xl">
        <thead>
          <tr className="border-b-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Origin
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Intensity (gCO2e/MJ)
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => {
            // Debug log each route to verify actualIntensity is present
            // eslint-disable-next-line no-console
            console.log(`[RoutesTab] Route ${route.id}:`, route);
            
            const intensity = route.actualIntensity;
            
            return (
              <tr
                key={route.id}
                className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-400 font-mono">
                  {route.id}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">{route.origin}</td>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                  {route.destination}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50 font-mono">
                  {typeof intensity === 'number' && intensity > 0 ? intensity.toFixed(2) : '—'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => {
                      // Allow setting baseline if intensity exists and is > 0
                      if (typeof intensity === 'number' && intensity > 0) {
                        // eslint-disable-next-line no-console
                        console.log(`[RoutesTab] Setting baseline: ${route.id} with intensity ${intensity}`);
                        onSetBaseline?.(route.id, intensity);
                      } else {
                        // eslint-disable-next-line no-console
                        console.warn(`[RoutesTab] Cannot set baseline for ${route.id}: invalid intensity`, intensity);
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    Set Baseline
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {routes.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          No routes available
        </div>
      )}
    </div>
  );
}
