/**
 * Configuration Adapter for Strategic Bug Fixer Agent
 *
 * Integrates with centralized agent-configuration package (v2.0+).
 * Uses factory pattern to eliminate boilerplate.
 */

import { createBugFixerAdapter } from '@jordanbmowry/agent-configuration/adapter-factory';
import { getBugFixerPreset } from '@jordanbmowry/agent-configuration/preset-configs';

// ============================================================================
// CREATE ADAPTER
// ============================================================================

const bugFixerAdapter = createBugFixerAdapter(getBugFixerPreset);

// ============================================================================
// EXPORT STANDARD METHODS
// ============================================================================

/**
 * Load bug fixer configuration
 * @param {string} configPath - Path to .agent-config.json
 * @returns {Object} Bug fixer configuration
 */
export const loadBugFixerConfig = bugFixerAdapter.loadConfig;

/**
 * Get complete configuration including presets
 * @param {string} configPath - Path to .agent-config.json
 * @returns {Object} Complete bug fixer configuration
 */
export const getConfig = bugFixerAdapter.getConfig;

/**
 * Check if bug fixer is enabled
 * @param {string} configPath - Path to .agent-config.json
 * @returns {boolean} True if enabled
 */
export const isBugFixerEnabled = bugFixerAdapter.isEnabled;

/**
 * Check if file should be skipped
 * @param {string} filename - File to check
 * @param {string} configPath - Path to .agent-config.json
 * @returns {boolean} True if should skip
 */
export const shouldSkipBugFix = bugFixerAdapter.shouldSkip;

/**
 * Create bug fixer configuration accessor
 * @param {string} configPath - Path to .agent-config.json
 * @returns {Object} Configuration accessor
 */
export const createBugFixerConfigAccessor = bugFixerAdapter.createAccessor;

/**
 * Get preset configuration
 * @param {string} type - Preset type (quick, thorough, security, performance)
 * @returns {Object} Preset configuration
 */
export const getPreset = bugFixerAdapter.getPreset;
