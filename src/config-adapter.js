/**
 * Configuration Adapter for Strategic Bug Fixer Agent
 *
 * Integrates with centralized agent-configuration package (v2.0+).
 * Uses factory pattern to eliminate boilerplate.
 */

import { createBugFixerAdapter } from '@jordanbmowry/agent-configuration/adapter-factory';
import { getBugFixerPreset } from '@jordanbmowry/agent-configuration/preset-configs';
import { getPromptTemplate } from '@jordanbmowry/agent-configuration/prompt-templates';

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

/**
 * Build bug fix prompt using prompt templates
 * @param {string} code - Code to fix
 * @param {string} filename - Filename
 * @param {string} errorMessage - Error message
 * @param {string} configPath - Path to .agent-config.json
 * @returns {string} Bug fix prompt
 */
export const buildBugFixPrompt = (
  code,
  filename,
  errorMessage,
  configPath = '.agent-config.json'
) => {
  const config = getConfig(configPath);

  // Get prompt configuration
  const promptConfig = config.prompts || { template: 'default', customVariables: {} };

  // Detect language from filename
  const ext = filename.split('.').pop();
  const languageMap = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    go: 'go',
    rs: 'rust',
  };
  const language = languageMap[ext] || 'javascript';

  // Prepare template variables
  const variables = {
    code,
    filename,
    errorMessage: errorMessage || 'Fix any potential issues',
    language,
    safetyLevel: config.safetyLevel || 'moderate',
    ...promptConfig.customVariables,
  };

  // Use functional API to get template
  return getPromptTemplate('bugFixer', promptConfig.template, variables, {
    templatesDir: promptConfig.templatesDir,
  });
};
