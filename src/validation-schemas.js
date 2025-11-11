/**
 * Validation Schemas for Bug Fixer Agent
 *
 * Bug-fixer-specific validation schemas using shared validation utilities.
 */

import {
  createSafeParser,
  createValidator,
} from '@jordanbmowry/agent-configuration/validation-utils';
import { z } from 'zod';

// ============================================================================
// BUG FIXER SCHEMAS
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
// VALIDATORS (using shared utilities)
// ============================================================================

export const validateBugFixResult = createValidator(
  BugFixResultSchema,
  'Bug fix result validation failed'
);

export const validateTestOutput = createValidator(
  TestOutputSchema,
  'Test output validation failed'
);

export const validateCIResult = createValidator(CIResultSchema, 'CI result validation failed');

export const validateCLIArgs = createValidator(CLIArgsSchema, 'CLI arguments validation failed');

export const validateGitOperationResult = createValidator(
  GitOperationResultSchema,
  'Git operation result validation failed'
);

// ============================================================================
// SAFE PARSERS (using shared utilities)
// ============================================================================

export const safeParseBugFixResult = createSafeParser(BugFixResultSchema);
export const safeParseTestOutput = createSafeParser(TestOutputSchema);
export const safeParseCIResult = createSafeParser(CIResultSchema);
export const safeParseCLIArgs = createSafeParser(CLIArgsSchema);
export const safeParseGitOperationResult = createSafeParser(GitOperationResultSchema);
