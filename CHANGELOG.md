# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-11-10

### 🎉 Major Refactor - Functional Programming

Complete rewrite of the codebase following strict functional programming principles.

### Added

- ✨ **Functional Programming Architecture**
  - Pure functions with no side effects
  - Immutability with `Object.freeze()` throughout
  - Composition over inheritance
  - Isolated side effects in dedicated functions

- 💰 **Cost Monitoring System**
  - Real-time cost tracking with `cost-monitor.js`
  - Daily spending limits ($10/day default)
  - Per-fix cost limits ($2/fix default)
  - Cost estimation before API calls
  - Detailed cost reports with `generateCostReport()`
  - Model cost comparison utilities

- 🛡️ **Type-Safe Validation**
  - Zod schemas for all data structures
  - Runtime validation for bug fix results, test outputs, configurations
  - Safe parsing functions that don't throw exceptions
  - Comprehensive schema coverage

- 🧪 **Comprehensive Testing**
  - Vitest test framework (replaces Jest)
  - Unit tests for config module (100% coverage)
  - Unit tests for cost monitor (100% coverage)
  - Mock-based testing for API calls
  - Coverage reporting with v8

- 🎨 **Code Quality Tools**
  - Biome for linting and formatting
  - Strict linting rules with cognitive complexity limits
  - Auto-formatting with consistent style
  - Import protocol enforcement (`node:` prefix)

- 📚 **Enhanced Documentation**
  - Comprehensive README with examples
  - ARCHITECTURE.md with FP principles explained
  - USAGE.md with 10+ usage examples
  - Inline JSDoc comments throughout codebase

- 🔧 **Configuration System**
  - Four pre-configured setups (quick, thorough, security, performance)
  - Custom configuration builder
  - Cost estimation per configuration
  - Configuration comparison utilities

### Changed

- 🔄 **Module Restructure**
  - Moved all source files to `src/` directory
  - `bug-fixer.js`: Class → Pure functions
  - `ci-bug-fixer.js`: Class inheritance → Composition
  - All functions now return frozen objects

- 📦 **Dependencies**
  - Added: `zod@^3.23.8` for validation
  - Added: `@biomejs/biome@^1.9.4` for linting
  - Added: `vitest@^2.1.8` for testing
  - Added: `@vitest/coverage-v8@^2.1.8` for coverage
  - Removed: `jest@^29.7.0` (replaced by Vitest)

- 🚀 **Scripts**
  - `npm test` → Vitest instead of Jest
  - `npm run fix-bug` → Points to `src/bug-fixer.js`
  - `npm run ci-fix` → Points to `src/ci-bug-fixer.js`
  - Added: `npm run lint` for linting
  - Added: `npm run lint:fix` for auto-fixing
  - Added: `npm run format` for formatting
  - Added: `npm run test:coverage` for coverage

- 🔐 **Environment Variables**
  - Added: `DAILY_COST_LIMIT` for daily budget
  - Added: `PER_FIX_COST_LIMIT` for per-fix budget
  - Added: `DEFAULT_MODEL` for model selection
  - Added: `DEFAULT_CONFIG_TYPE` for configuration
  - Added: `AUTO_COMMIT` for CI automation
  - Added: `AUTO_PUSH` for CI automation

### Improved

- ⚡ **Performance**
  - Parallel bug fixing with `fixBugsParallel()`
  - Efficient cost calculations
  - Optimized test output parsing

- 🛡️ **Error Handling**
  - Consistent error result objects
  - Graceful fallbacks for unknown models
  - Validation warnings instead of crashes
  - Detailed error context in results

- 📊 **Cost Efficiency**
  - Default to `gpt-4o-mini` (80% cheaper)
  - Pre-fix cost estimation
  - Budget enforcement before API calls
  - Cost tracking and reporting

- 🔍 **Bug Detection**
  - Improved test output parsing
  - Better file identification from stack traces
  - Multiple file support in CI mode
  - Error message extraction

### Fixed

- 🐛 **Bug Fixes**
  - Fixed import paths in refactored modules
  - Corrected Node.js import protocol usage
  - Fixed frozen object mutations
  - Improved git operation error handling

### Removed

- ❌ **Deprecated Code**
  - Removed class-based architecture
  - Removed Jest configuration
  - Removed inheritance patterns
  - Removed mutable state management

### Migration Guide (v1.0 → v2.0)

#### Breaking Changes

1. **Import Paths Changed**
   ```javascript
   // v1.0
   import { BugFixer } from './bug-fixer.js';
   const fixer = new BugFixer();
   await fixer.fixBug('file.js');
   
   // v2.0
   import { fixBug } from './src/bug-fixer.js';
   const result = await fixBug('file.js');
   ```

2. **Class → Functions**
   ```javascript
   // v1.0 (OOP)
   class BugFixer {
     async fixBug(filename) { /* ... */ }
   }
   
   // v2.0 (FP)
   export const fixBug = async (filename, errorMessage, options) => {
     // Pure function approach
   };
   ```

3. **Result Objects**
   ```javascript
   // v1.0
   { success: true, fixedCode: '...' }
   
   // v2.0 (frozen, with more metadata)
   Object.freeze({
     success: true,
     filename: 'file.js',
     originalCode: '...',
     fixedCode: '...',
     linesChanged: 5,
     timestamp: '2024-11-10T...',
     model: 'gpt-4o-mini',
   })
   ```

4. **Configuration**
   ```javascript
   // v1.0
   const fixer = new BugFixer({ model: 'gpt-4o-mini', maxTokens: 2000 });
   
   // v2.0
   const result = await fixBug('file.js', '', {
     model: 'gpt-4o-mini',
     maxTokens: 2000,
     configType: 'thorough',
   });
   ```

#### New Features to Adopt

1. **Cost Monitoring**
   ```javascript
   import { estimateFixCost, isWithinLimits } from './src/cost-monitor.js';
   
   const code = readFileSync('file.js', 'utf8');
   const cost = estimateFixCost(code.length);
   
   if (isWithinLimits(cost)) {
     await fixBug('file.js');
   }
   ```

2. **Validation**
   ```javascript
   import { validateBugFixResult } from './src/validation-schemas.js';
   
   const result = await fixBug('file.js');
   const validation = validateBugFixResult(result);
   
   if (!validation.success) {
     console.warn('Validation warnings:', validation.errors);
   }
   ```

3. **Parallel Fixes**
   ```javascript
   import { fixBugsParallel } from './src/bug-fixer.js';
   
   const fixes = [
     { filename: 'file1.js', errorMessage: 'Error 1' },
     { filename: 'file2.js', errorMessage: 'Error 2' },
   ];
   
   const results = await fixBugsParallel(fixes);
   ```

## [1.0.0] - 2024-11-01

### Added

- Initial release
- Basic bug fixing with OpenAI GPT
- Jest testing integration
- CLI interface
- GitHub Actions workflow
- Class-based architecture

---

## Version Legend

- 🎉 Major Release
- ✨ New Feature
- 🔄 Changed
- 🐛 Bug Fix
- 📚 Documentation
- 🔧 Configuration
- ⚡ Performance
- 🛡️ Security
- ❌ Deprecated
- 🧪 Testing
