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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-200 bg-slate-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Origin
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr
              key={route.id}
              className="border-b border-slate-200 hover:bg-emerald-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                {route.id}
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">{route.origin}</td>
              <td className="px-6 py-4 text-sm text-slate-700">
                {route.destination}
              </td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={() => onSetBaseline?.(route.id, 0)}
                  className="inline-flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Set Baseline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {routes.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No routes available
        </div>
      )}
    </div>
  );
}
