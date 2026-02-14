import { Dashboard } from './adapters/ui';


/**
 * App Component
 * Entry point for React application
 * Renders the Dashboard with all FuelEU features
 */
export function App() {
  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Dashboard />
    </div>
  );
}

export default App;
