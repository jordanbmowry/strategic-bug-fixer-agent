/**
 * Unit tests for bug fixer presets (from centralized configuration)
 */

import {
  comparePresetCosts,
  createBugFixerPresets,
  getAvailablePresets,
  getBugFixerPreset,
  getCheapestPreset,
  getMostExpensivePreset,
  hasPreset,
} from '@jordanbmowry/agent-configuration/preset-configs';
import { describe, expect, it } from 'vitest';

describe('Bug Fixer Presets', () => {
  describe('Configuration Presets', () => {
    it('should get quick preset with correct properties', () => {
      const config = getBugFixerPreset('quick');

      expect(config.name).toBe('quick');
      expect(config.model).toBe('gpt-4o-mini');
      expect(config.maxTokens).toBe(1500);
      expect(config.temperature).toBe(0.3);
      expect(config).toHaveProperty('costPer1KTokens');
    });

    it('should get thorough preset with correct properties', () => {
      const config = getBugFixerPreset('thorough');

      expect(config.name).toBe('thorough');
      expect(config.model).toBe('gpt-4o-mini');
      expect(config.maxTokens).toBe(3000);
      expect(config.temperature).toBe(0.2);
    });

    it('should get security preset with gpt-4o model', () => {
      const config = getBugFixerPreset('security');

      expect(config.name).toBe('security');
      expect(config.model).toBe('gpt-4o');
      expect(config.maxTokens).toBe(4000);
      expect(config.temperature).toBe(0.1);
    });

    it('should get performance preset with correct properties', () => {
      const config = getBugFixerPreset('performance');

      expect(config.name).toBe('performance');
      expect(config.model).toBe('gpt-4o');
      expect(config.maxTokens).toBe(3500);
      expect(config.temperature).toBe(0.2);
    });

    it('should return frozen configuration objects', () => {
      const config = getBugFixerPreset('quick');
      expect(Object.isFrozen(config)).toBe(true);
    });
  });

  describe('Preset Registry', () => {
    it('should get preset by type', () => {
      const config = getBugFixerPreset('quick');
      expect(config.name).toBe('quick');
    });

    it('should return quick preset for unknown type', () => {
      const config = getBugFixerPreset('unknown-type');
      expect(config.name).toBe('quick');
    });

    it('should create all presets', () => {
      const presets = createBugFixerPresets();

      expect(presets).toHaveProperty('quick');
      expect(presets).toHaveProperty('thorough');
      expect(presets).toHaveProperty('security');
      expect(presets).toHaveProperty('performance');
      expect(Object.isFrozen(presets)).toBe(true);
    });

    it('should list available preset type names', () => {
      const presets = createBugFixerPresets();
      const types = getAvailablePresets(presets);

      expect(types).toContain('quick');
      expect(types).toContain('thorough');
      expect(types).toContain('security');
      expect(types).toContain('performance');
      expect(Object.isFrozen(types)).toBe(true);
    });

    it('should check if preset exists', () => {
      const presets = createBugFixerPresets();
      expect(hasPreset(presets, 'quick')).toBe(true);
      expect(hasPreset(presets, 'thorough')).toBe(true);
      expect(hasPreset(presets, 'nonexistent')).toBe(false);
    });
  });

  describe('Preset Utilities', () => {
    it('should compare preset costs correctly', () => {
      const quick = getBugFixerPreset('quick');
      const security = getBugFixerPreset('security');
      const comparison = comparePresetCosts(quick, security);

      expect(comparison).toBeLessThan(0); // Quick should be cheaper than security
    });

    it('should get cheapest preset', () => {
      const presets = createBugFixerPresets();
      const cheapest = getCheapestPreset(presets);

      expect(cheapest.name).toBe('quick'); // Quick should be cheapest
    });

    it('should get most expensive preset', () => {
      const presets = createBugFixerPresets();
      const expensive = getMostExpensivePreset(presets);

      // Security or performance should be most expensive
      expect(['security', 'performance']).toContain(expensive.name);
    });
  });

  describe('Pure Function Properties', () => {
    it('should always return same result for same input', () => {
      const config1 = getBugFixerPreset('quick');
      const config2 = getBugFixerPreset('quick');

      expect(config1).toEqual(config2);
    });

    it('should not mutate objects', () => {
      const config = getBugFixerPreset('quick');
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
