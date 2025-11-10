# Usage Guide

Comprehensive examples and usage patterns for the Strategic Bug Fixer Agent.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [CLI Examples](#cli-examples)
3. [Programmatic API](#programmatic-api)
4. [Configuration](#configuration)
5. [Cost Management](#cost-management)
6. [CI/CD Integration](#cicd-integration)
7. [Advanced Patterns](#advanced-patterns)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Basic Usage

### Simple Bug Fix

Fix a file with automatic error detection:

```bash
pnpm fix-bug src/payment.js
```

### Fix with Error Context

Provide specific error message for better AI context:

```bash
pnpm fix-bug src/utils.js "TypeError: Cannot read property 'length' of undefined"
```

### CI Auto-Fix

Automatically detect and fix failing tests:

```bash
pnpm ci-fix
```

## CLI Examples

### Example 1: Fix ReferenceError

```bash
# Your test output shows:
# ReferenceError: calculateTotal is not defined

pnpm fix-bug src/cart.js "ReferenceError: calculateTotal is not defined"
```

**What happens:**
1. Reads `src/cart.js`
2. Sends code + error to AI
3. AI identifies missing function
4. Applies fix
5. Runs tests to verify
6. Commits if successful

### Example 2: Fix Type Error

```bash
pnpm fix-bug src/checkout.js "TypeError: Cannot read property 'price' of null"
```

**Expected output:**
```
🔍 Analyzing bug in src/checkout.js...
🔧 Applying potential fix, testing...
✅ Tests passed! Fix is working.
🎉 Bug fixed successfully!
📊 Lines changed: 3
```

### Example 3: CI Mode

```bash
# In your CI pipeline
pnpm ci-fix
```

**What it does:**
1. Runs `npm test`
2. If tests fail, parses output
3. Identifies affected files
4. Fixes each file
5. Commits and pushes (if configured)

## Programmatic API

### Example 1: Fix Single File

```javascript
import { fixBug } from './src/bug-fixer.js';

async function fixPaymentBug() {
  const result = await fixBug(
    'src/payment.js',
    'ReferenceError: total is not defined'
  );

  if (result.success) {
    console.log('✅ Fix successful!');
    console.log(`Changed ${result.linesChanged} lines`);
    console.log(`Model used: ${result.model}`);
    console.log(`Timestamp: ${result.timestamp}`);
  } else {
    console.error('❌ Fix failed:', result.error);
  }
}

fixPaymentBug();
```

### Example 2: Fix Multiple Files

```javascript
import { fixBugsParallel } from './src/bug-fixer.js';

async function fixMultipleBugs() {
  const fixes = [
    {
      filename: 'src/cart.js',
      errorMessage: 'TypeError: Cannot read property of undefined',
    },
    {
      filename: 'src/checkout.js',
      errorMessage: 'ReferenceError: price is not defined',
    },
    {
      filename: 'src/utils.js',
      errorMessage: 'SyntaxError: Unexpected token',
    },
  ];

  const results = await fixBugsParallel(fixes);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Fixed: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  // Log details
  for (const result of results) {
    if (result.success) {
      console.log(`✅ ${result.filename}: ${result.linesChanged} lines changed`);
    } else {
      console.log(`❌ ${result.filename}: ${result.error}`);
    }
  }
}

fixMultipleBugs();
```

### Example 3: Custom Configuration

```javascript
import { fixBug } from './src/bug-fixer.js';

async function securityFix() {
  const result = await fixBug('src/auth.js', 'Security vulnerability detected', {
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.1,
    configType: 'security',
  });

  console.log(result);
}

securityFix();
```

### Example 4: With Validation

```javascript
import { fixBug } from './src/bug-fixer.js';
import { validateBugFixResult } from './src/validation-schemas.js';

async function fixWithValidation() {
  const result = await fixBug('src/app.js', 'Bug description');

  // Validate result structure
  const validation = validateBugFixResult(result);

  if (!validation.success) {
    console.warn('⚠️  Result validation issues:', validation.errors);
  }

  if (result.success && validation.success) {
    console.log('✅ Fix successful and validated!');
  }
}

fixWithValidation();
```

## Configuration

### Example 1: Using Pre-configured Setups

```javascript
import { getConfig, fixBug } from './src/bug-fixer.js';

// Quick fix (default)
const quickResult = await fixBug('src/app.js', '', {
  configType: 'quick',
});

// Thorough analysis
const thoroughResult = await fixBug('src/complex.js', '', {
  configType: 'thorough',
});

// Security-focused
const securityResult = await fixBug('src/auth.js', '', {
  configType: 'security',
});

// Performance optimization
const perfResult = await fixBug('src/slow.js', '', {
  configType: 'performance',
});
```

### Example 2: Custom Configuration

```javascript
import { createCustomConfig, fixBug } from './src/bug-fixer.js';

const customConfig = createCustomConfig({
  name: 'my-config',
  model: 'gpt-4o',
  maxTokens: 3000,
  temperature: 0.15,
  description: 'Custom config for complex bugs',
});

const result = await fixBug('src/app.js', '', customConfig);
```

### Example 3: Configuration Comparison

```javascript
import { compareConfigs, getConfig } from './src/config.js';

const quick = getConfig('quick');
const security = getConfig('security');

const comparison = compareConfigs(quick, security);

console.log(`Cheaper config: ${comparison.cheaper}`);
console.log(`Cost difference: $${comparison.costDifference.toFixed(4)}`);
console.log(`Token difference: ${comparison.tokenDifference}`);
```

## Cost Management

### Example 1: Estimate Before Fixing

```javascript
import { fixBug } from './src/bug-fixer.js';
import { estimateFixCost, isWithinLimits } from './src/cost-monitor.js';
import { readFileSync } from 'node:fs';

async function fixWithCostCheck() {
  // Read file to estimate
  const code = readFileSync('src/app.js', 'utf8');
  const estimatedCost = estimateFixCost(code.length, 2000, 'gpt-4o-mini');

  console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);

  if (!isWithinLimits(estimatedCost)) {
    console.log('❌ Cost exceeds daily limit');
    return;
  }

  const result = await fixBug('src/app.js');
  console.log(result);
}

fixWithCostCheck();
```

### Example 2: Cost Tracking

```javascript
import { createCostTracker } from './src/cost-monitor.js';
import { fixBug } from './src/bug-fixer.js';

async function fixWithTracking() {
  const tracker = createCostTracker({
    dailyLimit: 5.0,
    perFixLimit: 1.0,
  });

  const files = ['src/app.js', 'src/utils.js', 'src/api.js'];

  for (const file of files) {
    // Check if we can afford
    const estimatedCost = 0.001; // Estimate based on file size
    const check = tracker.canAfford(estimatedCost);

    if (!check.allowed) {
      console.log(`⚠️  Cannot afford to fix ${file}`);
      console.log(`Remaining budget: $${check.remainingDaily.toFixed(4)}`);
      break;
    }

    // Fix the file
    const result = await fixBug(file);

    if (result.success) {
      // Record actual cost
      tracker.recordFix(estimatedCost);
      console.log(`✅ Fixed ${file}`);
    }
  }

  // Generate report
  console.log(tracker.generateReport());
}

fixWithTracking();
```

### Example 3: Model Cost Comparison

```javascript
import { compareModelCosts, formatCost } from './src/cost-monitor.js';

const comparison = compareModelCosts('gpt-4o-mini', 'gpt-4o', 1000, 2000);

console.log('Model Comparison:');
console.log(`${comparison.model1.name}: ${formatCost(comparison.model1.cost)}`);
console.log(`${comparison.model2.name}: ${formatCost(comparison.model2.cost)}`);
console.log(`Cheaper: ${comparison.cheaper}`);
console.log(`Savings: ${formatCost(comparison.savings)} (${comparison.percentDifference}%)`);
```

## CI/CD Integration

### Example 1: GitHub Actions Workflow

```yaml
# .github/workflows/auto-bug-fix.yml
name: Auto Bug Fix

on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [develop]

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Configure Git
        run: |
          git config user.name "Auto Bug Fixer"
          git config user.email "action@github.com"

      - name: Run bug fixer
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          DAILY_COST_LIMIT: 5.0
          AUTO_COMMIT: true
          AUTO_PUSH: true
        run: pnpm ci-fix
```

### Example 2: Custom CI Script

```javascript
// scripts/ci-fix.js
import { runCIFixWithRetries } from './src/ci-bug-fixer.js';

async function main() {
  console.log('🚀 Starting CI bug fixer...');

  const result = await runCIFixWithRetries({
    maxRetries: 3,
    autoCommit: process.env.AUTO_COMMIT === 'true',
    autoPush: process.env.AUTO_PUSH === 'true',
    configType: 'thorough',
  });

  console.log('\n📊 CI Fix Results:');
  console.log(`  Total files attempted: ${result.totalAttempted}`);
  console.log(`  Successfully fixed: ${result.successful}`);
  console.log(`  Failed to fix: ${result.failed}`);
  console.log(`  Tests passing: ${result.finalTestsPassed ? '✅' : '❌'}`);

  if (result.committed) {
    console.log('  Changes committed: ✅');
  }

  process.exit(result.finalTestsPassed ? 0 : 1);
}

main();
```

### Example 3: Conditional CI Fix

```javascript
import { runCIFix } from './src/ci-bug-fixer.js';
import { getCostStats } from './src/cost-monitor.js';

async function conditionalFix() {
  // Check current cost stats
  const stats = getCostStats();

  if (stats.remainingBudget < 1.0) {
    console.log('⚠️  Insufficient budget for CI fix');
    process.exit(1);
  }

  // Only run on main branch
  const branch = process.env.GITHUB_REF_NAME;
  if (branch !== 'main') {
    console.log('ℹ️  Skipping CI fix on non-main branch');
    process.exit(0);
  }

  const result = await runCIFix({
    autoCommit: true,
    autoPush: false,
  });

  console.log(result);
}

conditionalFix();
```

## Advanced Patterns

### Example 1: Retry Logic

```javascript
import { fixBug } from './src/bug-fixer.js';

async function fixWithRetry(filename, error, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Attempt ${attempt} of ${maxRetries}...`);

    const result = await fixBug(filename, error);

    if (result.success) {
      console.log(`✅ Fixed on attempt ${attempt}`);
      return result;
    }

    if (attempt < maxRetries) {
      console.log('Retrying with different configuration...');
      // Try with more thorough config
      const retryResult = await fixBug(filename, error, {
        configType: 'thorough',
      });

      if (retryResult.success) {
        return retryResult;
      }
    }
  }

  console.log('❌ All retry attempts failed');
  return { success: false };
}

fixWithRetry('src/app.js', 'Complex error message');
```

### Example 2: Batch Processing

```javascript
import { fixBug } from './src/bug-fixer.js';
import { createCostTracker } from './src/cost-monitor.js';

async function batchFix(files) {
  const tracker = createCostTracker({ dailyLimit: 10.0 });
  const results = [];

  for (const file of files) {
    console.log(`\nProcessing ${file}...`);

    // Check budget
    const canAfford = tracker.canAfford(0.01);
    if (!canAfford.allowed) {
      console.log(`⚠️  Budget exceeded, stopping batch`);
      break;
    }

    const result = await fixBug(file);
    results.push(result);

    if (result.success) {
      tracker.recordFix(0.01);
    }

    // Small delay between fixes
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  const successful = results.filter((r) => r.success).length;
  console.log(`\n📊 Batch Summary:`);
  console.log(`  Total: ${results.length}`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Failed: ${results.length - successful}`);
  console.log(tracker.generateReport());

  return results;
}

const files = ['src/a.js', 'src/b.js', 'src/c.js'];
batchFix(files);
```

### Example 3: Smart Configuration Selection

```javascript
import { getRecommendedConfig } from './src/config.js';
import { fixBug } from './src/bug-fixer.js';
import { readFileSync } from 'node:fs';

async function smartFix(filename, errorMessage) {
  const code = readFileSync(filename, 'utf8');

  // Determine criteria
  const criteria = {
    budget: code.length > 1000 ? 'high' : 'low',
    complexity: errorMessage.includes('Security') ? 'complex' : 'simple',
    security: errorMessage.toLowerCase().includes('security'),
  };

  // Get recommended config
  const config = getRecommendedConfig(criteria);

  console.log(`Using ${config.name} configuration`);

  const result = await fixBug(filename, errorMessage, {
    configType: config.name,
  });

  return result;
}

smartFix('src/auth.js', 'Security: XSS vulnerability detected');
```

## Best Practices

### 1. Always Estimate Costs First

```javascript
import { estimateFixCost, isWithinLimits } from './src/cost-monitor.js';
import { readFileSync } from 'node:fs';

const code = readFileSync('large-file.js', 'utf8');
const cost = estimateFixCost(code.length, 4000, 'gpt-4o');

if (!isWithinLimits(cost)) {
  console.log('Consider using gpt-4o-mini or breaking into smaller files');
}
```

### 2. Use Appropriate Configurations

```javascript
// Simple syntax error → quick config
await fixBug('src/typo.js', 'SyntaxError', { configType: 'quick' });

// Complex logic bug → thorough config
await fixBug('src/algorithm.js', 'Wrong output', { configType: 'thorough' });

// Security issue → security config
await fixBug('src/auth.js', 'XSS vulnerability', { configType: 'security' });
```

### 3. Validate Results

```javascript
import { validateBugFixResult } from './src/validation-schemas.js';

const result = await fixBug('src/app.js');
const validation = validateBugFixResult(result);

if (!validation.success) {
  console.warn('Result structure issues:', validation.errors);
}
```

### 4. Track Costs in Production

```javascript
const tracker = createCostTracker({
  dailyLimit: parseFloat(process.env.DAILY_COST_LIMIT) || 10.0,
  perFixLimit: parseFloat(process.env.PER_FIX_COST_LIMIT) || 2.0,
});

// Use tracker for all fixes
// Generate daily reports
```

### 5. Handle Errors Gracefully

```javascript
try {
  const result = await fixBug('src/app.js', 'Error message');

  if (!result.success) {
    console.error('Fix failed:', result.error);
    // Fallback: notify team, create issue, etc.
  }
} catch (error) {
  console.error('Fatal error:', error);
  // Handle API errors, file not found, etc.
}
```

## Troubleshooting

### Issue: Tests Still Failing

```javascript
// Try with more thorough configuration
const result = await fixBug('src/app.js', error, {
  configType: 'thorough',
  maxTokens: 4000,
});
```

### Issue: Cost Limit Exceeded

```javascript
// Check current spending
import { getCostStats } from './src/cost-monitor.js';

const stats = getCostStats();
console.log(`Daily spend: $${stats.dailySpend.toFixed(4)}`);
console.log(`Remaining: $${stats.remainingBudget.toFixed(4)}`);

// Use cheaper model
await fixBug('src/app.js', error, { model: 'gpt-4o-mini' });
```

### Issue: AI Not Understanding Error

```javascript
// Provide more context in error message
const detailedError = `
Error: Cannot read property 'length' of undefined
Location: src/app.js:42
Context: Trying to access user.name.length but user might be null
Stack trace: ...
`;

await fixBug('src/app.js', detailedError);
```

### Issue: File Not Being Fixed

```javascript
// Check if file exists
import { fileExists } from './src/bug-fixer.js';

if (!fileExists('src/app.js')) {
  console.error('File not found');
}

// Check test command
await fixBug('src/app.js', error, {
  testCommand: 'npm run test:unit', // Custom test command
});
```

---

For more information, see:
- [README.md](./README.md) - Overview and quick start
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Design principles and patterns
- [CHANGELOG.md](./CHANGELOG.md) - Version history

**Need help?** Open an issue on GitHub or check the documentation.
