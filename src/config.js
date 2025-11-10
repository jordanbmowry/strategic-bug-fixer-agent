/**
 * Configuration Module - Functional Programming Implementation
 *
 * Provides pre-configured setups for different bug-fixing scenarios.
 * All configurations are immutable and pure.
 */

// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================

/**
 * Quick fix configuration - Fast, cost-effective
 * @returns {Object} Frozen configuration object
 */
export const createQuickConfig = () => {
  return Object.freeze({
    name: 'quick',
    model: 'gpt-4o-mini',
    maxTokens: 1500,
    temperature: 0.3,
    description: 'Fast fixes for simple bugs',
    costPer1KTokens: { input: 0.00015, output: 0.0006 },
  });
};

/**
 * Thorough fix configuration - Balanced quality and cost
 * @returns {Object} Frozen configuration object
 */
export const createThoroughConfig = () => {
  return Object.freeze({
    name: 'thorough',
    model: 'gpt-4o-mini',
    maxTokens: 3000,
    temperature: 0.2,
    description: 'Comprehensive analysis with detailed fixes',
    costPer1KTokens: { input: 0.00015, output: 0.0006 },
  });
};

/**
 * Security fix configuration - Focus on security issues
 * @returns {Object} Frozen configuration object
 */
export const createSecurityConfig = () => {
  return Object.freeze({
    name: 'security',
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.1,
    description: 'Security-focused fixes with strict validation',
    costPer1KTokens: { input: 0.0025, output: 0.01 },
  });
};

/**
 * Performance fix configuration - Optimize for performance
 * @returns {Object} Frozen configuration object
 */
export const createPerformanceConfig = () => {
  return Object.freeze({
    name: 'performance',
    model: 'gpt-4o',
    maxTokens: 3500,
    temperature: 0.2,
    description: 'Performance optimization and efficiency fixes',
    costPer1KTokens: { input: 0.0025, output: 0.01 },
  });
};

// ============================================================================
// CONFIGURATION REGISTRY
// ============================================================================

/**
 * Get all available configuration types
 * @returns {Object} Frozen map of configuration types
 */
export const getConfigTypes = () => {
  return Object.freeze({
    quick: createQuickConfig(),
    thorough: createThoroughConfig(),
    security: createSecurityConfig(),
    performance: createPerformanceConfig(),
  });
};

/**
 * Get configuration by type
 * @param {string} type - Configuration type name
 * @returns {Object} Frozen configuration object
 */
export const getConfig = (type = 'quick') => {
  const configs = getConfigTypes();

  if (!configs[type]) {
    console.warn(`Unknown config type: ${type}, using 'quick' instead`);
    return configs.quick;
  }

  return configs[type];
};

/**
 * List available configuration types
 * @returns {Array<string>} Array of config type names
 */
export const getAvailableTypes = () => {
  return Object.freeze(Object.keys(getConfigTypes()));
};

/**
 * Check if configuration type exists
 * @param {string} type - Configuration type name
 * @returns {boolean} True if type exists
 */
export const hasConfigType = (type) => {
  return Object.hasOwn(getConfigTypes(), type);
};

/**
 * Create custom configuration
 * @param {Object} options - Custom configuration options
 * @returns {Object} Frozen custom configuration
 */
export const createCustomConfig = (options = {}) => {
  const defaults = createQuickConfig();

  return Object.freeze({
    name: options.name || 'custom',
    model: options.model || defaults.model,
    maxTokens: options.maxTokens || defaults.maxTokens,
    temperature: options.temperature ?? defaults.temperature,
    description: options.description || 'Custom configuration',
    costPer1KTokens: options.costPer1KTokens || defaults.costPer1KTokens,
  });
};

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Estimate cost for a fix based on configuration
 * @param {Object} config - Configuration object
 * @param {number} inputTokens - Estimated input tokens
 * @param {number} outputTokens - Estimated output tokens
 * @returns {number} Estimated cost in USD
 */
export const estimateCost = (config, inputTokens, outputTokens) => {
  const inputCost = (inputTokens / 1000) * config.costPer1KTokens.input;
  const outputCost = (outputTokens / 1000) * config.costPer1KTokens.output;

  return inputCost + outputCost;
};

/**
 * Format configuration for display
 * @param {Object} config - Configuration object
 * @returns {string} Formatted configuration string
 */
export const formatConfig = (config) => {
  return `${config.name} (${config.model}) - ${config.description}`;
};

/**
 * Compare two configurations
 * @param {Object} config1 - First configuration
 * @param {Object} config2 - Second configuration
 * @returns {Object} Comparison result
 */
export const compareConfigs = (config1, config2) => {
  const cost1 = estimateCost(config1, 1000, 1000);
  const cost2 = estimateCost(config2, 1000, 1000);

  return Object.freeze({
    cheaper: cost1 < cost2 ? config1.name : config2.name,
    costDifference: Math.abs(cost1 - cost2),
    tokenDifference: Math.abs(config1.maxTokens - config2.maxTokens),
  });
};

/**
 * Get recommended configuration based on criteria
 * @param {Object} criteria - Selection criteria
 * @returns {Object} Recommended configuration
 */
export const getRecommendedConfig = (criteria = {}) => {
  const { budget = 'low', complexity = 'simple', security = false } = criteria;

  if (security) {
    return getConfig('security');
  }

  if (complexity === 'complex') {
    return getConfig('thorough');
  }

  if (budget === 'high') {
    return getConfig('performance');
  }

  return getConfig('quick');
};
