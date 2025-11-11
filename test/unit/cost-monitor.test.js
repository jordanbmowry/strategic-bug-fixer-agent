/**
 * Unit tests for cost monitor (from centralized configuration)
 */

import {
  DEFAULT_LIMITS,
  MODEL_PRICING,
  calculateCost,
  createCostTracker,
  estimateCost,
  estimateTokens,
  formatCost,
  getModelPricing,
  isWithinLimits,
  requiresWarning,
} from '@jordanbmowry/agent-configuration/cost-monitor';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Cost Monitor (Centralized)', () => {
  describe('Model Pricing', () => {
    it('should return pricing for known models', () => {
      const pricing = getModelPricing('gpt-4o-mini');

      expect(pricing).toHaveProperty('input');
      expect(pricing).toHaveProperty('output');
      expect(pricing.input).toBeLessThan(pricing.output);
      expect(Object.isFrozen(pricing)).toBe(true);
    });

    it('should return mini pricing for unknown models', () => {
      const unknownPricing = getModelPricing('unknown-model');
      const miniPricing = getModelPricing('gpt-4o-mini');

      expect(unknownPricing).toEqual(miniPricing);
    });

    it('should have MODEL_PRICING constant', () => {
      expect(MODEL_PRICING).toHaveProperty('gpt-4o-mini');
      expect(MODEL_PRICING).toHaveProperty('gpt-4o');
      expect(Object.isFrozen(MODEL_PRICING)).toBe(true);
    });
  });

  describe('Cost Calculations', () => {
    it('should calculate cost correctly', () => {
      const cost = calculateCost('gpt-4o-mini', 1000, 1000);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should estimate tokens from text length', () => {
      const tokens = estimateTokens(1000);

      expect(tokens).toBe(Math.ceil(1000 / 4));
      expect(tokens).toBeGreaterThan(0);
    });

    it('should estimate tokens from string', () => {
      const text = 'a'.repeat(1000);
      const tokens = estimateTokens(text);

      expect(tokens).toBe(250); // 1000 chars / 4
    });

    it('should estimate operation cost', () => {
      const cost = estimateCost('gpt-4o-mini', 1000, 2000);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });
  });

  describe('Cost Limits', () => {
    it('should check if cost is within limits', () => {
      const result = isWithinLimits(1.0, 5.0, { daily: 10.0, perOperation: 2.0 });

      expect(result.allowed).toBe(true);
      expect(result.withinDaily).toBe(true);
      expect(result.withinPerOperation).toBe(true);
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should detect daily limit exceeded', () => {
      const result = isWithinLimits(6.0, 5.0, { daily: 10.0, perOperation: 10.0 });

      expect(result.allowed).toBe(false);
      expect(result.withinDaily).toBe(false);
      expect(result.reason).toContain('Daily limit');
    });

    it('should detect per-operation limit exceeded', () => {
      const result = isWithinLimits(6.0, 0, { daily: 100.0, perOperation: 5.0 });

      expect(result.allowed).toBe(false);
      expect(result.withinPerOperation).toBe(false);
      expect(result.reason).toContain('Per-operation limit');
    });

    it('should use default limits', () => {
      const result = isWithinLimits(5.0, 0);

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('dailyRemaining');
    });

    it('should check if warning is required', () => {
      expect(requiresWarning(0.3, 0.5)).toBe(false);
      expect(requiresWarning(0.5, 0.5)).toBe(true);
      expect(requiresWarning(0.6, 0.5)).toBe(true);
    });
  });

  describe('Cost Formatting', () => {
    it('should format costs correctly', () => {
      expect(formatCost(1.23456)).toContain('$');
      expect(formatCost(0.0001)).toContain('$');
      expect(formatCost(10.5)).toContain('$');
    });

    it('should format small costs in millicents', () => {
      const formatted = formatCost(0.005);
      expect(formatted).toContain('m'); // millicents indicator
    });
  });

  describe('Cost Tracker', () => {
    let tracker;

    beforeEach(() => {
      tracker = createCostTracker({
        daily: 10.0,
        perOperation: 2.0,
        warning: 0.5,
      });
    });

    it('should create cost tracker with frozen API', () => {
      expect(Object.isFrozen(tracker)).toBe(true);
      expect(tracker).toHaveProperty('recordCost');
      expect(tracker).toHaveProperty('getTotalCost');
      expect(tracker).toHaveProperty('getOperations');
      expect(tracker).toHaveProperty('canAfford');
      expect(tracker).toHaveProperty('generateReport');
      expect(tracker).toHaveProperty('reset');
    });

    it('should record costs', () => {
      const operation = tracker.recordCost(1.5, { filename: 'test.js' });

      expect(operation.cost).toBe(1.5);
      expect(operation).toHaveProperty('timestamp');
      expect(operation.filename).toBe('test.js');
      expect(Object.isFrozen(operation)).toBe(true);
    });

    it('should accumulate costs', () => {
      tracker.recordCost(1.0);
      tracker.recordCost(2.0);

      const total = tracker.getTotalCost();
      expect(total).toBe(3.0);
    });

    it('should check affordability', () => {
      tracker.recordCost(5.0);

      const canAfford = tracker.canAfford(4.0);
      expect(canAfford).toHaveProperty('allowed');
      expect(canAfford.withinDaily).toBe(true);
      expect(Object.isFrozen(canAfford)).toBe(true);
    });

    it('should generate cost report', () => {
      tracker.recordCost(1.0, { operation: 'fix1' });
      tracker.recordCost(2.0, { operation: 'fix2' });

      const report = tracker.generateReport();

      expect(report.totalCost).toBe(3.0);
      expect(report.operationCount).toBe(2);
      expect(report.averageCost).toBe(1.5);
      expect(report.withinLimits).toBe(true);
      expect(Object.isFrozen(report)).toBe(true);
    });

    it('should reset tracker', () => {
      tracker.recordCost(5.0);
      tracker.reset();

      const total = tracker.getTotalCost();
      expect(total).toBe(0);
    });
  });

  describe('Pure Function Properties', () => {
    it('should always return same result for same input', () => {
      const cost1 = calculateCost('gpt-4o-mini', 1000, 500);
      const cost2 = calculateCost('gpt-4o-mini', 1000, 500);

      expect(cost1).toBe(cost2);
    });

    it('should not mutate pricing objects', () => {
      const pricing = getModelPricing('gpt-4o-mini');
      const originalInput = pricing.input;

      try {
        pricing.input = 999;
      } catch (e) {
        // Expected in strict mode
      }

      expect(pricing.input).toBe(originalInput);
    });
  });
});
