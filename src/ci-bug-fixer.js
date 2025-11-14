/**
 * CI Bug Fixer - Functional Programming Implementation
 *
 * Automated bug fixing for CI/CD environments.
 * Implements strict functional programming principles:
 * - Pure functions for parsing and analysis
 * - Immutability with Object.freeze()
 * - Isolated side effects for git operations
 */

import { execSync } from 'node:child_process';
import { createLogger } from '@jordanbmowry/agent-configuration/logger';
import { fileExists, fixBug, runTests } from './bug-fixer.js';
import { validateTestOutput } from './validation-schemas.js';

// Create logger for CI bug fixer
const logger = createLogger({ agentName: 'ci-bug-fixer' });

// ============================================================================
// PURE FUNCTIONS - Test Output Parsing
// ============================================================================

/**
 * Parse test output to extract failure information
 * @param {string} output - Raw test output
 * @returns {Object} Frozen object with file and error info
 */
export const parseTestOutput = (output) => {
  const outputText = output.toString();

  // Find the file to fix from stack traces
  const stackMatch = outputText.match(/at \w+.*\(([^)]+\.js):\d+:\d+\)/);

  let sourceFile = './cart.js'; // fallback

  if (stackMatch?.[1]) {
    const matchedFile = stackMatch[1];

    // Exclude test files and node_modules
    const isValid = !matchedFile.includes('.test.') && !matchedFile.includes('node_modules');

    if (isValid) {
      sourceFile = matchedFile.startsWith('./') ? matchedFile : `./${matchedFile}`;
    }
  }

  return Object.freeze({
    file: sourceFile,
    error: `Jest test failures:\n\n${outputText}`,
    hasFailures: outputText.includes('FAIL') || outputText.includes('Error'),
  });
};

/**
 * Extract error messages from test output
 * @param {string} output - Test output
 * @returns {Array<string>} Array of error messages
 */
export const extractErrorMessages = (output) => {
  const lines = output.split('\n');
  const errors = [];

  for (const line of lines) {
    if (line.includes('Error:') || line.includes('Expected') || line.includes('Received')) {
      errors.push(line.trim());
    }
  }

  return Object.freeze(errors);
};

/**
 * Identify which files to fix from test output
 * @param {string} output - Test output
 * @returns {Array<string>} Array of file paths to fix
 */
export const identifyFilesToFix = (output) => {
  const parsed = parseTestOutput(output);
  const files = new Set();

  // Add primary file from stack trace
  if (parsed.file && fileExists(parsed.file)) {
    files.add(parsed.file);
  }

  // Look for additional files mentioned in errors
  const fileMatches = output.matchAll(/(?:at|in|from)\s+([a-zA-Z0-9/_-]+\.js)/g);
  for (const match of fileMatches) {
    const file = match[1];
    if (!file.includes('test') && !file.includes('node_modules')) {
      const path = file.startsWith('./') ? file : `./${file}`;
      if (fileExists(path)) {
        files.add(path);
      }
    }
  }

  return Object.freeze(Array.from(files));
};

/**
 * Create CI fix configuration
 * @param {Object} options - Configuration options
 * @returns {Object} Frozen configuration
 */
export const createCIConfig = (options = {}) => {
  return Object.freeze({
    testCommand: options.testCommand || 'npm test',
    maxRetries: options.maxRetries || 3,
    autoCommit: options.autoCommit ?? true,
    autoPush: options.autoPush ?? false,
    commitMessage: options.commitMessage || '🤖 Auto-fix: Resolve test failures',
    model: options.model || 'gpt-4o-mini',
    configType: options.configType || 'thorough',
  });
};

/**
 * Create CI result object
 * @param {Array<Object>} fixes - Array of fix results
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Frozen CI result
 */
export const createCIResult = (fixes, metadata = {}) => {
  const successful = fixes.filter((f) => f.success);
  const failed = fixes.filter((f) => !f.success);

  return Object.freeze({
    totalAttempted: fixes.length,
    successful: successful.length,
    failed: failed.length,
    fixes: Object.freeze(fixes),
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

// ============================================================================
// SIDE EFFECTS - Git Operations (Isolated)
// ============================================================================

/**
 * Configure git with user information
 * @param {string} name - Git user name
 * @param {string} email - Git user email
 * @returns {Object} Result with success flag
 */
export const configureGit = (name = 'Auto Bug Fixer', email = 'action@github.com') => {
  try {
    execSync(`git config user.name "${name}"`, { stdio: 'pipe' });
    execSync(`git config user.email "${email}"`, { stdio: 'pipe' });

    return Object.freeze({
      success: true,
      message: 'Git configured successfully',
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Stage all changes
 * @returns {Object} Result with success flag
 */
export const stageChanges = () => {
  try {
    execSync('git add .', { stdio: 'pipe' });

    return Object.freeze({
      success: true,
      message: 'Changes staged',
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Commit changes
 * @param {string} message - Commit message
 * @returns {Object} Result with success flag
 */
export const commitChanges = (message) => {
  try {
    execSync(`git commit -m "${message}"`, { stdio: 'pipe' });

    return Object.freeze({
      success: true,
      message: 'Changes committed',
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Push changes to remote
 * @returns {Object} Result with success flag
 */
export const pushChanges = () => {
  try {
    execSync('git push', { stdio: 'pipe' });

    return Object.freeze({
      success: true,
      message: 'Changes pushed',
    });
  } catch (error) {
    return Object.freeze({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Commit and optionally push fixes
 * @param {string} message - Commit message
 * @param {boolean} shouldPush - Whether to push changes
 * @returns {Object} Result with success flag
 */
export const commitFixes = (message, shouldPush = false) => {
  logger.info('Committing fixes', { function: 'commitFixes', message, shouldPush });
  console.log('📝 Committing fixes...');

  const gitConfig = configureGit();
  if (!gitConfig.success) {
    logger.warn('Git configuration failed', { function: 'commitFixes', error: gitConfig.error });
    console.log('⚠️  Git configuration failed:', gitConfig.error);
  }

  const staged = stageChanges();
  if (!staged.success) {
    logger.error('Failed to stage changes', { function: 'commitFixes', error: staged.error });
    console.log('❌ Failed to stage changes:', staged.error);
    return Object.freeze({
      success: false,
      error: 'Failed to stage changes',
    });
  }

  const committed = commitChanges(message);
  if (!committed.success) {
    logger.error('Failed to commit changes', { function: 'commitFixes', error: committed.error, message });
    console.log('❌ Failed to commit:', committed.error);
    return Object.freeze({
      success: false,
      error: 'Failed to commit changes',
    });
  }

  logger.info('Changes committed', { function: 'commitFixes', message });
  console.log('✅ Changes committed');

  if (shouldPush) {
    const pushed = pushChanges();
    if (!pushed.success) {
      logger.error('Failed to push changes', { function: 'commitFixes', error: pushed.error });
      console.log('❌ Failed to push:', pushed.error);
      return Object.freeze({
        success: false,
        error: 'Failed to push changes',
        committed: true,
      });
    }
    logger.info('Changes pushed successfully', { function: 'commitFixes' });
    console.log('✅ Changes pushed');
  }

  return Object.freeze({
    success: true,
    committed: true,
    pushed: shouldPush,
  });
};

// ============================================================================
// ORCHESTRATION - Main CI Fix Logic
// ============================================================================

/**
 * Run bug fixes for CI environment
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} CI result object
 */
export const runCIFix = async (options = {}) => {
  logger.info('Starting CI fix process', { function: 'runCIFix', options });
  console.log('🔍 Checking for test failures...');

  const config = createCIConfig(options);
  logger.debug('CI configuration created', { function: 'runCIFix', config });

  // Run tests to see what's failing
  logger.debug('Running tests', { function: 'runCIFix', testCommand: config.testCommand });
  const testResult = runTests(config.testCommand);

  if (testResult.success) {
    logger.info('All tests passing - no fixes needed', { function: 'runCIFix' });
    console.log('✅ All tests passing - no fixes needed');
    return createCIResult([], {
      testsPassedInitially: true,
      message: 'No fixes needed',
    });
  }

  // Tests failed - parse output and identify files
  logger.warn('Tests failed - attempting to fix', { 
    function: 'runCIFix',
    testCommand: config.testCommand,
    hasOutput: !!testResult.output,
    hasError: !!testResult.error,
  });
  console.log('❌ Tests failed - attempting to fix...');

  const testOutput = testResult.output + (testResult.error || '');
  logger.debug('Test output received', { function: 'runCIFix', outputLength: testOutput.length });
  
  const validation = validateTestOutput({ output: testOutput });

  if (!validation.success) {
    logger.warn('Test output validation warnings', { function: 'runCIFix', errors: validation.errors });
    console.warn('⚠️  Test output validation warnings:', validation.errors);
  }

  const filesToFix = identifyFilesToFix(testOutput);
  logger.info('Files to fix identified', { 
    function: 'runCIFix',
    count: filesToFix.length, 
    files: filesToFix 
  });

  if (filesToFix.length === 0) {
    logger.warn('Could not identify files to fix from test output', { function: 'runCIFix', testOutput });
    console.log('⚠️  Could not identify files to fix from test output');
    return createCIResult([], {
      error: 'Could not identify files to fix',
      testOutput,
    });
  }

  logger.info('Starting file fixes', { function: 'runCIFix', fileCount: filesToFix.length, files: filesToFix });
  console.log(`🔧 Attempting to fix ${filesToFix.length} file(s)...`);

  // Fix each file
  const fixes = [];
  for (const file of filesToFix) {
    logger.info('Fixing file', { function: 'runCIFix', file, attempt: fixes.length + 1, total: filesToFix.length });
    console.log(`🔧 Fixing ${file}...`);

    const errorContext = parseTestOutput(testOutput).error;
    const fixResult = await fixBug(file, errorContext, {
      configType: config.configType,
      model: config.model,
      testCommand: config.testCommand,
    });

    fixes.push(fixResult);

    if (fixResult.success) {
      logger.info('File fixed successfully', { function: 'runCIFix', file, linesChanged: fixResult.linesChanged });
      console.log(`✅ Fixed ${file}`);
    } else {
      logger.error('Failed to fix file', { function: 'runCIFix', file, error: fixResult.error });
      console.log(`❌ Could not fix ${file}`);
    }
  }

  const result = createCIResult(fixes, { testOutput });

  // Commit fixes if configured and any succeeded
  if (config.autoCommit && result.successful > 0) {
    const commitResult = commitFixes(config.commitMessage, config.autoPush);
    return Object.freeze({
      ...result,
      committed: commitResult.success,
      commitError: commitResult.error,
    });
  }

  return result;
};

/**
 * Run CI fix with retries
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Final result
 */
export const runCIFixWithRetries = async (options = {}) => {
  const config = createCIConfig(options);
  logger.info('Starting CI fix with retries', { function: 'runCIFixWithRetries', maxRetries: config.maxRetries, config });
  let lastResult = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    logger.info('CI fix attempt', { function: 'runCIFixWithRetries', attempt, maxRetries: config.maxRetries });
    console.log(`\n🔄 Attempt ${attempt} of ${config.maxRetries}`);

    lastResult = await runCIFix(options);

    // Check if tests pass now
    logger.debug('Re-running tests after fix attempt', { function: 'runCIFixWithRetries', attempt });
    const testResult = runTests(config.testCommand);
    if (testResult.success) {
      logger.info('All tests passing after fixes', { function: 'runCIFixWithRetries', attempt, totalAttempts: attempt });
      console.log('🎉 All tests passing after fixes!');
      return Object.freeze({
        ...lastResult,
        finalTestsPassed: true,
        attempts: attempt,
      });
    }

    if (attempt < config.maxRetries) {
      logger.warn('Tests still failing, will retry', { function: 'runCIFixWithRetries', attempt, maxRetries: config.maxRetries });
      console.log('⚠️  Tests still failing, retrying...');
    }
  }

  logger.error('Could not fix all issues after retries', { 
    function: 'runCIFixWithRetries',
    attempts: config.maxRetries,
    lastResult: lastResult ? {
      totalAttempted: lastResult.totalAttempted,
      successful: lastResult.successful,
      failed: lastResult.failed,
    } : null,
  });
  console.log('💥 Could not fix all issues after retries');
  return Object.freeze({
    ...lastResult,
    finalTestsPassed: false,
    attempts: config.maxRetries,
  });
};

// ============================================================================
// CLI INTERFACE
// ============================================================================

/**
 * Main CI execution function
 */
export const main = async () => {
  try {
    logger.info('Starting CI bug fixer main process', { function: 'main' });
    const result = await runCIFixWithRetries({
      maxRetries: 3,
      autoCommit: true,
      autoPush: true,
    });

    logger.info('CI fix process completed', {
      function: 'main',
      totalAttempted: result.totalAttempted,
      successful: result.successful,
      failed: result.failed,
      finalTestsPassed: result.finalTestsPassed,
      committed: result.committed,
      attempts: result.attempts,
    });

    console.log('\n📊 Final Results:');
    console.log(`  Total files attempted: ${result.totalAttempted}`);
    console.log(`  Successfully fixed: ${result.successful}`);
    console.log(`  Failed to fix: ${result.failed}`);
    console.log(`  Tests passing: ${result.finalTestsPassed ? '✅' : '❌'}`);

    if (result.committed) {
      console.log('  Changes committed: ✅');
    }

    process.exit(result.finalTestsPassed ? 0 : 1);
  } catch (error) {
    logger.error('Fatal error in CI bug fixer', { 
      function: 'main',
      error: error.message, 
      stack: error.stack 
    });
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Unhandled fatal error', { function: 'main', error: error.message, stack: error.stack });
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
