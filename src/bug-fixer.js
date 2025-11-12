/**
 * Bug Fixer - Functional Programming Implementation
 *
 * Core module for AI-powered bug detection and fixing.
 * Implements strict functional programming principles:
 * - Pure functions with no side effects
 * - Immutability with Object.freeze()
 * - Composition over inheritance
 * - Isolated side effects in dedicated functions
 *
 * Now integrates with centralized agent-configuration package
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { openai } from '@ai-sdk/openai';
import { estimateCost, isWithinLimits } from '@jordanbmowry/agent-configuration/cost-monitor';
import { createGitHubCostTracker } from '@jordanbmowry/agent-configuration/github-cost-tracker';
import { generateText } from 'ai';
import {
  buildBugFixPrompt,
  getConfig,
  isBugFixerEnabled,
  shouldSkipBugFix,
} from './config-adapter.js';
import { validateBugFixResult } from './validation-schemas.js';

// ============================================================================
// PURE FUNCTIONS - Configuration & Prompts
// ============================================================================

/**
 * Create bug fix configuration from options
 * @param {Object} options - Configuration options
 * @returns {Object} Frozen configuration object
 */
export const createFixConfig = (options = {}) => {
  const configPath = options.configPath || '.agent-config.json';
  const config = getConfig(configPath);

  return Object.freeze({
    model: options.model || config.model,
    maxTokens: options.maxTokens || config.maxTokens,
    temperature: options.temperature ?? config.temperature,
    maxRetries: options.maxRetries || config.maxRetries,
    testCommand: options.testCommand || config.testCommand,
    ...config,
  });
};

// buildBugFixPrompt now imported from config-adapter.js

/**
 * Extract clean code from AI response
 * @param {string} aiResponse - Raw AI response
 * @returns {string} Cleaned code
 */
export const extractCleanCode = (aiResponse) => {
  let cleaned = aiResponse.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:javascript|js)?\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
  }

  return cleaned.trim();
};

/**
 * Create success result object
 * @param {string} originalCode - Original source code
 * @param {string} fixedCode - Fixed source code
 * @param {string} filename - File that was fixed
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Frozen success result
 */
export const createSuccessResult = (originalCode, fixedCode, filename, metadata = {}) => {
  return Object.freeze({
    success: true,
    filename,
    originalCode,
    fixedCode,
    timestamp: new Date().toISOString(),
    linesChanged: countChangedLines(originalCode, fixedCode),
    ...metadata,
  });
};

/**
 * Create error result object
 * @param {string} filename - File being processed
 * @param {Error} error - Error that occurred
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Frozen error result
 */
export const createErrorResult = (filename, error, metadata = {}) => {
  return Object.freeze({
    success: false,
    filename,
    error: error.message || String(error),
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

/**
 * Count changed lines between two code versions
 * @param {string} original - Original code
 * @param {string} fixed - Fixed code
 * @returns {number} Number of changed lines
 */
export const countChangedLines = (original, fixed) => {
  const originalLines = original.split('\n');
  const fixedLines = fixed.split('\n');

  let changes = 0;
  const maxLength = Math.max(originalLines.length, fixedLines.length);

  for (let i = 0; i < maxLength; i++) {
    if (originalLines[i] !== fixedLines[i]) {
      changes++;
    }
  }

  return changes;
};

// ============================================================================
// SIDE EFFECTS - File Operations (Isolated)
// ============================================================================

/**
 * Read file contents
 * @param {string} filename - Path to file
 * @returns {Promise<string>} File contents
 */
export const readFileContent = async (filename) => {
  return await readFile(filename, 'utf8');
};

/**
 * Write file contents
 * @param {string} filename - Path to file
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
export const writeFileContent = async (filename, content) => {
  await writeFile(filename, content, 'utf8');
};

/**
 * Check if file exists
 * @param {string} filename - Path to file
 * @returns {boolean} True if file exists
 */
export const fileExists = (filename) => {
  return existsSync(filename);
};

/**
 * Run tests and return result
 * @param {string} command - Test command to run
 * @returns {Object} Test result with success flag and output
 */
export const runTests = (command) => {
  try {
    const output = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
    });

    return Object.freeze({
      success: true,
      output: output || '',
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      output: error.stdout?.toString() || '',
      error: error.stderr?.toString() || error.message,
    });
  }
};

// ============================================================================
// AI OPERATIONS - API Calls (Side Effects)
// ============================================================================

/**
 * Analyze bug and generate fix using AI
 * @param {string} code - Original code
 * @param {string} filename - File being analyzed
 * @param {string} errorMessage - Error context
 * @param {Object} config - Fix configuration
 * @returns {Promise<string>} Fixed code
 */
export const analyzeAndFix = async (code, filename, errorMessage, config) => {
  const prompt = buildBugFixPrompt(code, filename, errorMessage);

  // Cost check before API call
  const estimatedCost = estimateCost(config.model, code, config.maxTokens);
  const limitCheck = isWithinLimits(estimatedCost);
  if (!limitCheck.allowed) {
    throw new Error(
      limitCheck.reason || `Cost limit exceeded. Estimated: $${estimatedCost.toFixed(4)}`
    );
  }

  const { text, usage } = await generateText({
    model: openai(config.model),
    prompt,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
  });

  // Track cost in GitHub
  const costTracker = createGitHubCostTracker();
  if (costTracker.isAvailable() && usage) {
    try {
      const result = await costTracker.trackCost(
        'bugFixer',
        usage.promptTokens || 0,
        usage.completionTokens || 0,
        config.model
      );
      console.log(
        `💰 Cost: $${result.cost.toFixed(4)} | Monthly: $${result.monthlyTotal.toFixed(2)}`
      );
    } catch (error) {
      console.warn('⚠️  Failed to track cost in GitHub:', error.message);
    }
  }

  return extractCleanCode(text);
};

// ============================================================================
// ORCHESTRATION - Main Fix Logic
// ============================================================================

/**
 * Apply fix and test it
 * @param {string} filename - File to fix
 * @param {string} originalCode - Original code
 * @param {string} fixedCode - Fixed code
 * @param {Object} config - Fix configuration
 * @returns {Promise<Object>} Result object with success flag
 */
export const applyAndTest = async (filename, originalCode, fixedCode, config) => {
  console.log('🔧 Applying potential fix, testing...');

  // Apply fix
  await writeFileContent(filename, fixedCode);

  // Run tests
  const testResult = runTests(config.testCommand);

  if (testResult.success) {
    console.log('✅ Tests passed! Fix is working.');
    return Object.freeze({
      success: true,
      testOutput: testResult.output,
    });
  }

  // Tests failed - rollback
  console.log('❌ Tests failed, rolling back to original code');
  await writeFileContent(filename, originalCode);

  return Object.freeze({
    success: false,
    testOutput: testResult.output,
    error: testResult.error,
  });
};

/**
 * Fix bug in a file
 * @param {string} filename - File to fix
 * @param {string} errorMessage - Error message or context
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Result object
 */
export const fixBug = async (filename, errorMessage = '', options = {}) => {
  try {
    console.log(`🔍 Analyzing bug in ${filename}...`);

    // Create configuration
    const config = createFixConfig(options);

    // Validate file exists
    if (!fileExists(filename)) {
      throw new Error(`File not found: ${filename}`);
    }

    // Read original code
    const originalCode = await readFileContent(filename);

    // Generate fix
    const fixedCode = await analyzeAndFix(originalCode, filename, errorMessage, config);

    // Apply and test
    const testResult = await applyAndTest(filename, originalCode, fixedCode, config);

    if (testResult.success) {
      console.log('🎉 Bug fixed successfully!');
      const result = createSuccessResult(originalCode, fixedCode, filename, {
        testOutput: testResult.testOutput,
        model: config.model,
      });

      // Validate result structure
      const validation = validateBugFixResult(result);
      if (!validation.success) {
        console.warn('⚠️  Result validation warnings:', validation.errors);
      }

      return result;
    }

    console.log('💥 Could not create a working fix');
    return createErrorResult(filename, new Error('Tests failed after applying fix'), {
      testOutput: testResult.testOutput,
      testError: testResult.error,
    });
  } catch (error) {
    console.error(`❌ Error fixing bug in ${filename}:`, error.message);
    return createErrorResult(filename, error);
  }
};

/**
 * Fix multiple bugs in parallel
 * @param {Array<Object>} fixes - Array of {filename, errorMessage, options}
 * @returns {Promise<Array<Object>>} Array of results
 */
export const fixBugsParallel = async (fixes) => {
  const promises = fixes.map(({ filename, errorMessage, options }) =>
    fixBug(filename, errorMessage, options)
  );

  return await Promise.all(promises);
};

// ============================================================================
// CLI INTERFACE
// ============================================================================

/**
 * Parse command line arguments
 * @param {Array<string>} argv - Process arguments
 * @returns {Object} Parsed arguments
 */
export const parseCliArgs = (argv) => {
  const filename = argv[2];
  const errorMessage = argv[3] || '';

  return Object.freeze({
    filename,
    errorMessage,
    hasFilename: Boolean(filename),
  });
};

/**
 * Display CLI usage information
 */
export const showUsage = () => {
  console.log('Usage: node bug-fixer.js <filename> [error-message]');
  console.log('\nExamples:');
  console.log('  node bug-fixer.js src/payment.js');
  console.log('  node bug-fixer.js utils.js "Cannot read property of undefined"');
  console.log('\nOptions:');
  console.log('  --config=<type>  Use specific config (quick, thorough, security)');
  console.log('  --model=<name>   Override AI model');
};

/**
 * Main CLI execution function
 */
export const main = async () => {
  const args = parseCliArgs(process.argv);

  if (!args.hasFilename) {
    showUsage();
    process.exit(1);
  }

  if (!fileExists(args.filename)) {
    console.error(`❌ File not found: ${args.filename}`);
    process.exit(1);
  }

  const result = await fixBug(args.filename, args.errorMessage);

  if (result.success) {
    console.log('🎉 Bug fixed! Review the changes and commit when ready.');
    console.log(`📊 Lines changed: ${result.linesChanged}`);
    process.exit(0);
  }

  console.log('💥 Could not automatically fix the bug');
  console.log('You may need to fix this manually or provide more context');
  process.exit(1);
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
