/**
 * Unit tests for cost monitor module
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  calculateCost,
  canAffordFix,
  compareModelCosts,
  createCostTracker,
  estimateFixCost,
  estimateTokens,
  formatCost,
  generateCostReport,
  getCheapestModel,
  getCostStats,
  getModelPricing,
  getMostExpensiveModel,
  isWithinLimits,
  recordFixCost,
  requiresWarning,
} from '../../src/cost-monitor.js';

describe('Cost Monitor Module', () => {
  describe('Model Pricing', () => {
    it('should return frozen pricing object', () => {
      const pricing = getModelPricing();

      expect(pricing).toHaveProperty('gpt-4o-mini');
      expect(pricing).toHaveProperty('gpt-4o');
      expect(pricing).toHaveProperty('gpt-4');
      expect(Object.isFrozen(pricing)).toBe(true);
    });

    it('should have correct pricing structure', () => {
      const pricing = getModelPricing();
      const miniPricing = pricing['gpt-4o-mini'];

      expect(miniPricing).toHaveProperty('input');
      expect(miniPricing).toHaveProperty('output');
      expect(miniPricing.input).toBeLessThan(miniPricing.output);
    });
  });

  describe('Cost Calculations', () => {
    it('should calculate cost correctly', () => {
      const cost = calculateCost('gpt-4o-mini', 1000, 1000);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should use mini pricing for unknown models', () => {
      const cost = calculateCost('unknown-model', 1000, 1000);
      const miniCost = calculateCost('gpt-4o-mini', 1000, 1000);

      expect(cost).toBe(miniCost);
    });

    it('should estimate tokens from code length', () => {
      const tokens = estimateTokens(1000);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBe(Math.ceil(1000 / 4));
    });

    it('should estimate fix cost correctly', () => {
      const cost = estimateFixCost(1000, 2000, 'gpt-4o-mini');

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should use default parameters for fix cost estimation', () => {
      const cost = estimateFixCost(1000);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('Cost Limits', () => {
    it('should check if cost is within limits', () => {
      expect(isWithinLimits(1.0, 10.0, 5.0)).toBe(true);
      expect(isWithinLimits(6.0, 10.0, 5.0)).toBe(false);
    });

    it('should use default limits', () => {
      expect(isWithinLimits(5.0)).toBe(true);
      expect(isWithinLimits(15.0)).toBe(false);
    });

    it('should check if warning is required', () => {
      expect(requiresWarning(0.5, 1.0)).toBe(false);
      expect(requiresWarning(1.5, 1.0)).toBe(true);
    });
  });

  describe('Cost Formatting', () => {
    it('should format cost with 4 decimal places', () => {
      expect(formatCost(1.23456)).toBe('$1.2346');
      expect(formatCost(0.0001)).toBe('$0.0001');
    });
  });

  describe('Model Selection', () => {
    it('should return cheapest model', () => {
      expect(getCheapestModel()).toBe('gpt-4o-mini');
    });

    it('should return most expensive model', () => {
      expect(getMostExpensiveModel()).toBe('gpt-4');
    });

    it('should compare model costs correctly', () => {
      const comparison = compareModelCosts('gpt-4o-mini', 'gpt-4', 1000, 1000);

      expect(comparison).toHaveProperty('model1');
      expect(comparison).toHaveProperty('model2');
      expect(comparison).toHaveProperty('cheaper');
      expect(comparison).toHaveProperty('savings');
      expect(comparison.cheaper).toBe('gpt-4o-mini');
      expect(Object.isFrozen(comparison)).toBe(true);
    });
  });

  describe('Cost Tracker', () => {
    let tracker;

    beforeEach(() => {
      tracker = createCostTracker({
        dailyLimit: 10.0,
        perFixLimit: 2.0,
      });
    });

    it('should create cost tracker with frozen API', () => {
      expect(Object.isFrozen(tracker)).toBe(true);
    });

    it('should record fix costs', () => {
      const result = tracker.recordFix(1.5);

      expect(result.cost).toBe(1.5);
      expect(result.dailySpend).toBe(1.5);
      expect(result.fixCount).toBe(1);
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should accumulate costs', () => {
      tracker.recordFix(1.0);
      const result = tracker.recordFix(2.0);

      expect(result.dailySpend).toBe(3.0);
      expect(result.fixCount).toBe(2);
    });

    it('should check if fix is affordable', () => {
      const check1 = tracker.canAfford(5.0);
      expect(check1.allowed).toBe(false); // Over $2 per-fix limit
      expect(check1.withinDailyLimit).toBe(true);
      expect(check1.withinPerFixLimit).toBe(false); // Over $2 per fix limit

      const check2 = tracker.canAfford(1.5);
      expect(check2.allowed).toBe(true);
      expect(check2.withinPerFixLimit).toBe(true);
    });

    it('should return stats correctly', () => {
      tracker.recordFix(1.0);
      tracker.recordFix(2.0);

      const stats = tracker.getStats();

      expect(stats.dailySpend).toBe(3.0);
      expect(stats.fixCount).toBe(2);
      expect(stats.averageCostPerFix).toBe(1.5);
      expect(Object.isFrozen(stats)).toBe(true);
    });

    it('should generate cost report', () => {
      tracker.recordFix(1.0);
      tracker.recordFix(2.0);

      const report = tracker.generateReport();

      expect(report).toContain('Cost Report');
      expect(report).toContain('Daily Spend');
      expect(report).toContain('Fixes Completed');
      expect(typeof report).toBe('string');
    });

    it('should reset tracker', () => {
      tracker.recordFix(5.0);
      const resetResult = tracker.reset();

      expect(resetResult.success).toBe(true);

      const stats = tracker.getStats();
      expect(stats.dailySpend).toBe(0);
      expect(stats.fixCount).toBe(0);
    });
  });

  describe('Convenience Functions', () => {
    it('should check if fix is affordable using default tracker', () => {
      const result = canAffordFix(1.0);
      expect(typeof result).toBe('boolean');
    });

    it('should record fix cost using default tracker', () => {
      const result = recordFixCost(1.0);
      expect(result).toHaveProperty('cost');
      expect(result).toHaveProperty('dailySpend');
    });

    it('should get stats using default tracker', () => {
      const stats = getCostStats();
      expect(stats).toHaveProperty('dailySpend');
      expect(stats).toHaveProperty('fixCount');
    });

    it('should generate report using default tracker', () => {
      const report = generateCostReport();
      expect(typeof report).toBe('string');
      expect(report).toContain('Cost Report');
    });
  });

  describe('Immutability', () => {
    it('should return frozen objects from cost calculations', () => {
      const comparison = compareModelCosts('gpt-4o-mini', 'gpt-4', 1000, 1000);
      expect(Object.isFrozen(comparison)).toBe(true);
    });

    it('should not allow tracker state mutation from outside', () => {
      const tracker = createCostTracker();
      const stats1 = tracker.getStats();

      // Attempt to mutate (should have no effect)
      try {
        stats1.dailySpend = 999;
      } catch (e) {
        // Expected in strict mode
      }

      const stats2 = tracker.getStats();
      expect(stats2.dailySpend).not.toBe(999);
    });
  });
});
