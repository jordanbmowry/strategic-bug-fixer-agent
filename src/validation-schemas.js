/**
 * Validation Schemas - Type-safe validation with Zod
 *
 * Provides runtime validation for:
 * - Bug fix results
 * - Test outputs
 * - Configuration objects
 */

import { z } from 'zod';

// ============================================================================
// CORE SCHEMAS
// ============================================================================

/**
 * Bug fix result schema
 */
export const BugFixResultSchema = z.object({
  success: z.boolean(),
  filename: z.string().min(1),
  timestamp: z.string().datetime(),
  originalCode: z.string().optional(),
  fixedCode: z.string().optional(),
  linesChanged: z.number().int().nonnegative().optional(),
  testOutput: z.string().optional(),
  model: z.string().optional(),
  error: z.string().optional(),
  testError: z.string().optional(),
});

/**
 * Test output schema
 */
export const TestOutputSchema = z.object({
  output: z.string(),
  hasFailures: z.boolean().optional(),
  errors: z.array(z.string()).optional(),
});

/**
 * Configuration schema
 */
export const ConfigSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  maxTokens: z.number().int().positive(),
  temperature: z.number().min(0).max(2),
  description: z.string().optional(),
  costPer1KTokens: z
    .object({
      input: z.number().positive(),
      output: z.number().positive(),
    })
    .optional(),
});

/**
 * CI result schema
 */
export const CIResultSchema = z.object({
  totalAttempted: z.number().int().nonnegative(),
  successful: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  fixes: z.array(BugFixResultSchema),
  timestamp: z.string().datetime(),
  testsPassedInitially: z.boolean().optional(),
  committed: z.boolean().optional(),
  pushed: z.boolean().optional(),
  finalTestsPassed: z.boolean().optional(),
  attempts: z.number().int().positive().optional(),
  testOutput: z.string().optional(),
  error: z.string().optional(),
  commitError: z.string().optional(),
});

/**
 * CLI arguments schema
 */
export const CLIArgsSchema = z.object({
  filename: z.string().min(1).optional(),
  errorMessage: z.string().optional(),
  hasFilename: z.boolean(),
});

/**
 * Git operation result schema
 */
export const GitOperationResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  committed: z.boolean().optional(),
  pushed: z.boolean().optional(),
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate bug fix result
 * @param {any} data - Data to validate
 * @returns {Object} Validation result with success flag
 */
export const validateBugFixResult = (data) => {
  try {
    BugFixResultSchema.parse(data);
    return Object.freeze({
      success: true,
      data,
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      errors: error.errors,
      message: 'Bug fix result validation failed',
    });
  }
};

/**
 * Validate test output
 * @param {any} data - Data to validate
 * @returns {Object} Validation result with success flag
 */
export const validateTestOutput = (data) => {
  try {
    TestOutputSchema.parse(data);
    return Object.freeze({
      success: true,
      data,
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      errors: error.errors,
      message: 'Test output validation failed',
    });
  }
};

/**
 * Validate configuration
 * @param {any} data - Data to validate
 * @returns {Object} Validation result with success flag
 */
export const validateConfig = (data) => {
  try {
    ConfigSchema.parse(data);
    return Object.freeze({
      success: true,
      data,
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      errors: error.errors,
      message: 'Configuration validation failed',
    });
  }
};

/**
 * Validate CI result
 * @param {any} data - Data to validate
 * @returns {Object} Validation result with success flag
 */
export const validateCIResult = (data) => {
  try {
    CIResultSchema.parse(data);
    return Object.freeze({
      success: true,
      data,
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      errors: error.errors,
      message: 'CI result validation failed',
    });
  }
};

/**
 * Validate CLI arguments
 * @param {any} data - Data to validate
 * @returns {Object} Validation result with success flag
 */
export const validateCLIArgs = (data) => {
  try {
    CLIArgsSchema.parse(data);
    return Object.freeze({
      success: true,
      data,
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      errors: error.errors,
      message: 'CLI arguments validation failed',
    });
  }
};

/**
 * Validate git operation result
 * @param {any} data - Data to validate
 * @returns {Object} Validation result with success flag
 */
export const validateGitOperationResult = (data) => {
  try {
    GitOperationResultSchema.parse(data);
    return Object.freeze({
      success: true,
      data,
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      errors: error.errors,
      message: 'Git operation result validation failed',
    });
  }
};

// ============================================================================
// SAFE PARSING (No Exceptions)
// ============================================================================

/**
 * Safely parse bug fix result without throwing
 * @param {any} data - Data to parse
 * @returns {Object} Parse result
 */
export const safeParseBugFixResult = (data) => {
  const result = BugFixResultSchema.safeParse(data);
  return Object.freeze(result);
};

/**
 * Safely parse test output without throwing
 * @param {any} data - Data to parse
 * @returns {Object} Parse result
 */
export const safeParseTestOutput = (data) => {
  const result = TestOutputSchema.safeParse(data);
  return Object.freeze(result);
};

/**
 * Safely parse configuration without throwing
 * @param {any} data - Data to parse
 * @returns {Object} Parse result
 */
export const safeParseConfig = (data) => {
  const result = ConfigSchema.safeParse(data);
  return Object.freeze(result);
};

/**
 * Safely parse CI result without throwing
 * @param {any} data - Data to parse
 * @returns {Object} Parse result
 */
export const safeParseCIResult = (data) => {
  const result = CIResultSchema.safeParse(data);
  return Object.freeze(result);
};
