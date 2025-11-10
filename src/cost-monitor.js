/**
 * Cost Monitor - Functional Programming Implementation
 *
 * Tracks and manages costs for AI API calls.
 * Implements strict functional programming principles:
 * - Pure functions for calculations
 * - Immutability with Object.freeze()
 * - Factory pattern for state management
 */

// ============================================================================
// PURE FUNCTIONS - Cost Calculations
// ============================================================================

/**
 * Model pricing configuration
 * @returns {Object} Frozen pricing object
 */
export const getModelPricing = () => {
  return Object.freeze({
    'gpt-4o-mini': {
      input: 0.00015, // $0.15 per 1M tokens
      output: 0.0006, // $0.60 per 1M tokens
    },
    'gpt-4o': {
      input: 0.0025, // $2.50 per 1M tokens
      output: 0.01, // $10.00 per 1M tokens
    },
    'gpt-4': {
      input: 0.03, // $30.00 per 1M tokens
      output: 0.06, // $60.00 per 1M tokens
    },
  });
};

/**
 * Calculate cost for token usage
 * @param {string} model - Model name
 * @param {number} inputTokens - Input tokens used
 * @param {number} outputTokens - Output tokens used
 * @returns {number} Cost in USD
 */
export const calculateCost = (model, inputTokens, outputTokens) => {
  const pricing = getModelPricing();
  const modelPricing = pricing[model] || pricing['gpt-4o-mini'];

  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;

  return inputCost + outputCost;
};

/**
 * Estimate tokens from code length
 * @param {number} codeLength - Character count
 * @returns {number} Estimated tokens (rough approximation: 1 token ≈ 4 chars)
 */
export const estimateTokens = (codeLength) => {
  return Math.ceil(codeLength / 4);
};

/**
 * Estimate cost for a bug fix
 * @param {number} codeLength - Character count of code
 * @param {number} maxTokens - Maximum output tokens
 * @param {string} model - Model name
 * @returns {number} Estimated cost in USD
 */
export const estimateFixCost = (codeLength, maxTokens = 2000, model = 'gpt-4o-mini') => {
  const inputTokens = estimateTokens(codeLength);
  const outputTokens = maxTokens;

  return calculateCost(model, inputTokens, outputTokens);
};

/**
 * Check if cost is within limits
 * @param {number} cost - Cost to check
 * @param {number} dailyLimit - Daily cost limit
 * @param {number} currentDailySpend - Current daily spending
 * @returns {boolean} True if within limits
 */
export const isWithinLimits = (cost, dailyLimit = 10.0, currentDailySpend = 0) => {
  return currentDailySpend + cost <= dailyLimit;
};

/**
 * Check if cost requires warning
 * @param {number} cost - Cost to check
 * @param {number} threshold - Warning threshold
 * @returns {boolean} True if warning needed
 */
export const requiresWarning = (cost, threshold = 1.0) => {
  return cost >= threshold;
};

/**
 * Format cost for display
 * @param {number} cost - Cost in USD
 * @returns {string} Formatted cost string
 */
export const formatCost = (cost) => {
  return `$${cost.toFixed(4)}`;
};

/**
 * Get cheapest model for a task
 * @returns {string} Model name
 */
export const getCheapestModel = () => {
  return 'gpt-4o-mini';
};

/**
 * Get most expensive model
 * @returns {string} Model name
 */
export const getMostExpensiveModel = () => {
  return 'gpt-4';
};

/**
 * Compare model costs
 * @param {string} model1 - First model
 * @param {string} model2 - Second model
 * @param {number} inputTokens - Input tokens
 * @param {number} outputTokens - Output tokens
 * @returns {Object} Comparison result
 */
export const compareModelCosts = (model1, model2, inputTokens, outputTokens) => {
  const cost1 = calculateCost(model1, inputTokens, outputTokens);
  const cost2 = calculateCost(model2, inputTokens, outputTokens);

  return Object.freeze({
    model1: { name: model1, cost: cost1 },
    model2: { name: model2, cost: cost2 },
    cheaper: cost1 < cost2 ? model1 : model2,
    savings: Math.abs(cost1 - cost2),
    percentDifference: ((Math.abs(cost1 - cost2) / Math.max(cost1, cost2)) * 100).toFixed(2),
  });
};

// ============================================================================
// COST TRACKER - Factory Pattern for State Management
// ============================================================================

/**
 * Create cost tracker with state management
 * @param {Object} options - Configuration options
 * @returns {Object} Frozen tracker API
 */
export const createCostTracker = (options = {}) => {
  // Private state (not exposed)
  let dailySpend = 0;
  let fixCount = 0;
  let lastReset = new Date().toDateString();

  const dailyLimit = options.dailyLimit || 10.0;
  const perFixLimit = options.perFixLimit || 2.0;

  // Reset daily tracking if new day
  const checkAndResetDaily = () => {
    const today = new Date().toDateString();
    if (today !== lastReset) {
      dailySpend = 0;
      fixCount = 0;
      lastReset = today;
    }
  };

  // Public API (frozen)
  return Object.freeze({
    /**
     * Record a fix cost
     * @param {number} cost - Cost of the fix
     * @returns {Object} Updated stats
     */
    recordFix: (cost) => {
      checkAndResetDaily();
      dailySpend += cost;
      fixCount += 1;

      return Object.freeze({
        cost,
        dailySpend,
        fixCount,
        dailyLimit,
        remainingBudget: dailyLimit - dailySpend,
      });
    },

    /**
     * Check if a fix is within budget
     * @param {number} estimatedCost - Estimated cost
     * @returns {Object} Budget check result
     */
    canAfford: (estimatedCost) => {
      checkAndResetDaily();

      const withinDaily = dailySpend + estimatedCost <= dailyLimit;
      const withinPerFix = estimatedCost <= perFixLimit;

      return Object.freeze({
        allowed: withinDaily && withinPerFix,
        withinDailyLimit: withinDaily,
        withinPerFixLimit: withinPerFix,
        estimatedCost,
        dailySpend,
        remainingDaily: dailyLimit - dailySpend,
      });
    },

    /**
     * Get current stats
     * @returns {Object} Current spending stats
     */
    getStats: () => {
      checkAndResetDaily();

      return Object.freeze({
        dailySpend,
        fixCount,
        dailyLimit,
        perFixLimit,
        remainingBudget: dailyLimit - dailySpend,
        averageCostPerFix: fixCount > 0 ? dailySpend / fixCount : 0,
        lastReset,
      });
    },

    /**
     * Generate cost report
     * @returns {string} Formatted report
     */
    generateReport: () => {
      checkAndResetDaily();

      const avgCost = fixCount > 0 ? dailySpend / fixCount : 0;
      const percentUsed = ((dailySpend / dailyLimit) * 100).toFixed(1);

      return `
📊 Cost Report (${lastReset})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Daily Spend:      ${formatCost(dailySpend)} / ${formatCost(dailyLimit)} (${percentUsed}%)
  Fixes Completed:  ${fixCount}
  Avg Cost/Fix:     ${formatCost(avgCost)}
  Remaining Budget: ${formatCost(dailyLimit - dailySpend)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();
    },

    /**
     * Reset tracker (for testing or manual reset)
     * @returns {Object} Reset confirmation
     */
    reset: () => {
      dailySpend = 0;
      fixCount = 0;
      lastReset = new Date().toDateString();

      return Object.freeze({
        success: true,
        message: 'Cost tracker reset',
      });
    },
  });
};

// ============================================================================
// DEFAULT COST TRACKER INSTANCE
// ============================================================================

/**
 * Default cost tracker with standard limits
 */
export const costTracker = createCostTracker({
  dailyLimit: 10.0, // $10 per day
  perFixLimit: 2.0, // $2 per fix
});

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Check if fix is affordable (uses default tracker)
 * @param {number} estimatedCost - Estimated cost
 * @returns {boolean} True if affordable
 */
export const canAffordFix = (estimatedCost) => {
  const result = costTracker.canAfford(estimatedCost);
  return result.allowed;
};

/**
 * Record fix cost (uses default tracker)
 * @param {number} cost - Actual cost
 * @returns {Object} Updated stats
 */
export const recordFixCost = (cost) => {
  return costTracker.recordFix(cost);
};

/**
 * Get cost stats (uses default tracker)
 * @returns {Object} Current stats
 */
export const getCostStats = () => {
  return costTracker.getStats();
};

/**
 * Generate cost report (uses default tracker)
 * @returns {string} Formatted report
 */
export const generateCostReport = () => {
  return costTracker.generateReport();
};
