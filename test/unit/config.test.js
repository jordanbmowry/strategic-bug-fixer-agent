/**
 * Unit tests for config module
 */

import { describe, expect, it } from 'vitest';
import {
  compareConfigs,
  createCustomConfig,
  createPerformanceConfig,
  createQuickConfig,
  createSecurityConfig,
  createThoroughConfig,
  estimateCost,
  formatConfig,
  getAvailableTypes,
  getConfig,
  getConfigTypes,
  getRecommendedConfig,
  hasConfigType,
} from '../../src/config.js';

describe('Config Module', () => {
  describe('Configuration Presets', () => {
    it('should create quick config with correct properties', () => {
      const config = createQuickConfig();

      expect(config.name).toBe('quick');
      expect(config.model).toBe('gpt-4o-mini');
      expect(config.maxTokens).toBe(1500);
      expect(config.temperature).toBe(0.3);
      expect(config).toHaveProperty('costPer1KTokens');
    });

    it('should create thorough config with correct properties', () => {
      const config = createThoroughConfig();

      expect(config.name).toBe('thorough');
      expect(config.model).toBe('gpt-4o-mini');
      expect(config.maxTokens).toBe(3000);
      expect(config.temperature).toBe(0.2);
    });

    it('should create security config with gpt-4o model', () => {
      const config = createSecurityConfig();

      expect(config.name).toBe('security');
      expect(config.model).toBe('gpt-4o');
      expect(config.maxTokens).toBe(4000);
      expect(config.temperature).toBe(0.1);
    });

    it('should create performance config with correct properties', () => {
      const config = createPerformanceConfig();

      expect(config.name).toBe('performance');
      expect(config.model).toBe('gpt-4o');
      expect(config.maxTokens).toBe(3500);
      expect(config.temperature).toBe(0.2);
    });

    it('should return frozen configuration objects', () => {
      const config = createQuickConfig();
      expect(Object.isFrozen(config)).toBe(true);
    });
  });

  describe('Configuration Registry', () => {
    it('should get config by type', () => {
      const config = getConfig('quick');
      expect(config.name).toBe('quick');
    });

    it('should return quick config for unknown type', () => {
      const config = getConfig('unknown-type');
      expect(config.name).toBe('quick');
    });

    it('should return all config types', () => {
      const types = getConfigTypes();

      expect(types).toHaveProperty('quick');
      expect(types).toHaveProperty('thorough');
      expect(types).toHaveProperty('security');
      expect(types).toHaveProperty('performance');
      expect(Object.isFrozen(types)).toBe(true);
    });

    it('should list available config type names', () => {
      const types = getAvailableTypes();

      expect(types).toContain('quick');
      expect(types).toContain('thorough');
      expect(types).toContain('security');
      expect(types).toContain('performance');
      expect(Object.isFrozen(types)).toBe(true);
    });

    it('should check if config type exists', () => {
      expect(hasConfigType('quick')).toBe(true);
      expect(hasConfigType('thorough')).toBe(true);
      expect(hasConfigType('nonexistent')).toBe(false);
    });
  });

  describe('Custom Configuration', () => {
    it('should create custom config with defaults', () => {
      const config = createCustomConfig();

      expect(config.name).toBe('custom');
      expect(config.model).toBe('gpt-4o-mini');
      expect(Object.isFrozen(config)).toBe(true);
    });

    it('should create custom config with overrides', () => {
      const config = createCustomConfig({
        name: 'my-config',
        model: 'gpt-4o',
        maxTokens: 5000,
        temperature: 0.5,
      });

      expect(config.name).toBe('my-config');
      expect(config.model).toBe('gpt-4o');
      expect(config.maxTokens).toBe(5000);
      expect(config.temperature).toBe(0.5);
    });
  });

  describe('Configuration Utilities', () => {
    it('should estimate cost correctly', () => {
      const config = createQuickConfig();
      const cost = estimateCost(config, 1000, 1000);

      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(1); // Should be small for mini model
    });

    it('should format config for display', () => {
      const config = createQuickConfig();
      const formatted = formatConfig(config);

      expect(formatted).toContain('quick');
      expect(formatted).toContain('gpt-4o-mini');
      expect(formatted).toContain('Fast fixes');
    });

    it('should compare configs correctly', () => {
      const config1 = createQuickConfig();
      const config2 = createSecurityConfig();
      const comparison = compareConfigs(config1, config2);

      expect(comparison).toHaveProperty('cheaper');
      expect(comparison).toHaveProperty('costDifference');
      expect(comparison).toHaveProperty('tokenDifference');
      expect(comparison.cheaper).toBe('quick'); // Quick should be cheaper
    });

    it('should recommend config based on criteria', () => {
      const quickRec = getRecommendedConfig({
        budget: 'low',
        complexity: 'simple',
      });
      expect(quickRec.name).toBe('quick');

      const securityRec = getRecommendedConfig({ security: true });
      expect(securityRec.name).toBe('security');

      const thoroughRec = getRecommendedConfig({ complexity: 'complex' });
      expect(thoroughRec.name).toBe('thorough');
    });
  });

  describe('Pure Function Properties', () => {
    it('should always return same result for same input', () => {
      const config1 = getConfig('quick');
      const config2 = getConfig('quick');

      expect(config1).toEqual(config2);
    });

    it('should not mutate objects', () => {
      const config = getConfig('quick');
      const originalModel = config.model;

      // Attempt to mutate (should fail silently or throw in strict mode)
      try {
        config.model = 'gpt-4o';
      } catch (e) {
        // Expected in strict mode
      }

      expect(config.model).toBe(originalModel);
    });
  });
});
