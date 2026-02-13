import { MJ_PER_FUEL_UNIT, TARGET_INTENSITY_2025 } from './constants';

// Pure, side-effect free functions implementing the specified formulas.

export function energyInScope(fuelConsumption: number): number {
  if (!Number.isFinite(fuelConsumption)) {
    throw new Error('fuelConsumption must be a finite number');
  }
  if (fuelConsumption < 0) {
    throw new Error('fuelConsumption must be non-negative');
  }
  return fuelConsumption * MJ_PER_FUEL_UNIT;
}

export function complianceBalance(params: {
  target?: number; // gCO2e/MJ
  actual: number; // gCO2e/MJ
  fuelConsumption: number; // same units as accepted by energyInScope
}): number {
  const { target = TARGET_INTENSITY_2025, actual, fuelConsumption } = params;

  if (!Number.isFinite(target) || !Number.isFinite(actual)) {
    throw new Error('target and actual must be finite numbers');
  }
  const energy = energyInScope(fuelConsumption);
  // CB = (Target - Actual) * Energy_in_scope
  return (target - actual) * energy;
}

export function percentDifference(comparison: number, baseline: number): number {
  if (!Number.isFinite(comparison) || !Number.isFinite(baseline)) {
    throw new Error('comparison and baseline must be finite numbers');
  }
  if (baseline === 0) {
    throw new Error('baseline cannot be zero when calculating percent difference');
  }
  return (comparison / baseline - 1) * 100;
}

export type MathAPI = typeof import('./math');
