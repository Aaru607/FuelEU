import { energyInScope, complianceBalance, percentDifference } from '../math';
import { TARGET_INTENSITY_2025, MJ_PER_FUEL_UNIT } from '../constants';

describe('domain math functions', () => {
  describe('energyInScope', () => {
    it('calculates energy for positive fuel consumption', () => {
      const fuel = 2.5; // arbitrary unit
      expect(energyInScope(fuel)).toBeCloseTo(fuel * MJ_PER_FUEL_UNIT);
    });

    it('returns 0 for zero consumption', () => {
      expect(energyInScope(0)).toBe(0);
    });

    it('throws for negative or non-finite input', () => {
      expect(() => energyInScope(-1)).toThrow();
      expect(() => energyInScope(Number.POSITIVE_INFINITY)).toThrow();
    });
  });

  describe('complianceBalance', () => {
    it('computes CB with default target', () => {
      const fuel = 1.2;
      const actual = 100;
      const energy = fuel * MJ_PER_FUEL_UNIT;
      const expected = (TARGET_INTENSITY_2025 - actual) * energy;
      expect(complianceBalance({ actual, fuelConsumption: fuel })).toBeCloseTo(expected);
    });

    it('accepts explicit target override', () => {
      const fuel = 0.5;
      const actual = 80;
      const target = 90;
      const expected = (target - actual) * (fuel * MJ_PER_FUEL_UNIT);
      expect(complianceBalance({ target, actual, fuelConsumption: fuel })).toBeCloseTo(expected);
    });
  });

  describe('percentDifference', () => {
    it('calculates percent difference correctly', () => {
      const baseline = 50;
      const comparison = 75;
      // (75/50 -1)*100 = 50
      expect(percentDifference(comparison, baseline)).toBeCloseTo(50);
    });

    it('throws when baseline is zero', () => {
      expect(() => percentDifference(10, 0)).toThrow(/baseline cannot be zero/i);
    });
  });
});
