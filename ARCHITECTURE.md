# Architecture Documentation

## Functional Programming Principles

This project implements **strict functional programming (FP)** principles throughout the codebase. Every module follows these core tenets:

### 1. Pure Functions

**Definition**: Functions that always return the same output for the same input and have no side effects.

**Implementation**:
```javascript
// ✅ Pure function
export const calculateCost = (model, inputTokens, outputTokens) => {
  const pricing = getModelPricing();
  const modelPricing = pricing[model] || pricing['gpt-4o-mini'];
  
  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;
  
  return inputCost + outputCost;
};

// ❌ Impure function (mutates external state)
let totalCost = 0;
export const addCost = (cost) => {
  totalCost += cost; // Side effect!
  return totalCost;
};
```

### 2. Immutability

**Definition**: Data cannot be changed after creation.

**Implementation**:
```javascript
// All return values frozen
export const createFixConfig = (options = {}) => {
  const config = {
    model: options.model || 'gpt-4o-mini',
    maxTokens: options.maxTokens || 2000,
    temperature: options.temperature ?? 0.3,
  };
  
  return Object.freeze(config); // Immutable
};

// Nested objects also frozen
export const createSuccessResult = (originalCode, fixedCode, filename) => {
  return Object.freeze({
    success: true,
    filename,
    originalCode,
    fixedCode,
    timestamp: new Date().toISOString(),
    metadata: Object.freeze({ /* nested data */ }),
  });
};
```

### 3. Composition Over Inheritance

**Definition**: Build complex behavior by combining simple functions.

**Implementation**:
```javascript
// Simple, composable functions
export const parseTestOutput = (output) => { /* ... */ };
export const identifyFilesToFix = (output) => { /* ... */ };
export const extractErrorMessages = (output) => { /* ... */ };

// Composed orchestration
export const runCIFix = async (options) => {
  const config = createCIConfig(options);
  const testResult = runTests(config.testCommand);
  const testOutput = testResult.output + testResult.error;
  const filesToFix = identifyFilesToFix(testOutput);
  
  // No inheritance needed, just function composition
};
```

### 4. Isolated Side Effects

**Definition**: Side effects (I/O, API calls, mutations) are isolated to specific functions.

**Implementation**:
```javascript
// Pure functions (no side effects)
export const buildBugFixPrompt = (code, filename, error) => { /* ... */ };
export const extractCleanCode = (aiResponse) => { /* ... */ };
export const countChangedLines = (original, fixed) => { /* ... */ };

// Side effects clearly isolated
export const readFileContent = async (filename) => {
  return await readFile(filename, 'utf8'); // I/O side effect
};

export const analyzeAndFix = async (code, filename, error, config) => {
  const { text } = await generateText({ /* ... */ }); // API side effect
  return extractCleanCode(text);
};
```

## Module Architecture

### Core Modules

#### 1. `bug-fixer.js` - Core Logic

**Responsibilities**:
- Build AI prompts for bug fixing
- Extract clean code from AI responses
- Orchestrate fix workflow
- Manage file operations
- Test and validate fixes

**Key Functions**:
```javascript
// Pure Functions
createFixConfig()      // Configuration builder
buildBugFixPrompt()    // Prompt generation
extractCleanCode()     // Response parsing
createSuccessResult()  // Result object creation
countChangedLines()    // Diff calculation

// Side Effects (Isolated)
readFileContent()      // File I/O
writeFileContent()     // File I/O
runTests()             // Process execution
analyzeAndFix()        // API call

// Orchestration
fixBug()               // Main workflow
fixBugsParallel()      // Parallel execution
applyAndTest()         // Apply + validate
```

#### 2. `ci-bug-fixer.js` - CI Integration

**Responsibilities**:
- Parse test failure output
- Identify files to fix
- Manage git operations
- Retry logic for failed fixes

**Key Functions**:
```javascript
// Pure Functions
parseTestOutput()        // Extract failure info
identifyFilesToFix()     // Find affected files
extractErrorMessages()   // Parse error details
createCIConfig()         // CI configuration
createCIResult()         // Result aggregation

// Side Effects (Isolated)
configureGit()          // Git setup
stageChanges()          // Git add
commitChanges()         // Git commit
pushChanges()           // Git push

// Orchestration
runCIFix()              // Main CI workflow
runCIFixWithRetries()   // Retry logic
commitFixes()           // Commit orchestration
```

#### 3. `config.js` - Configuration Management

**Responsibilities**:
- Provide pre-configured setups
- Manage model pricing
- Configuration utilities

**Key Functions**:
```javascript
// Factory Functions (Pure)
createQuickConfig()      // Fast, cheap fixes
createThoroughConfig()   // Balanced approach
createSecurityConfig()   // Security-focused
createPerformanceConfig() // Performance-optimized
createCustomConfig()     // User-defined

// Registry Functions (Pure)
getConfig()             // Get by type
getConfigTypes()        // All configurations
getAvailableTypes()     // List type names
hasConfigType()         // Type existence check

// Utility Functions (Pure)
estimateCost()          // Cost calculation
formatConfig()          // Display formatting
compareConfigs()        // Cost comparison
getRecommendedConfig()  // Smart selection
```

#### 4. `cost-monitor.js` - Cost Tracking

**Responsibilities**:
- Calculate API costs
- Track daily spending
- Enforce budget limits
- Generate cost reports

**Key Functions**:
```javascript
// Pure Functions
getModelPricing()       // Pricing data
calculateCost()         // Cost calculation
estimateTokens()        // Token estimation
estimateFixCost()       // Pre-fix cost estimate
isWithinLimits()        // Budget check
requiresWarning()       // Warning threshold
formatCost()            // Display formatting
compareModelCosts()     // Model comparison

// Factory Pattern (State Management)
createCostTracker()     // Tracker factory
  ├─ recordFix()        // Log cost
  ├─ canAfford()        // Budget check
  ├─ getStats()         // Current stats
  ├─ generateReport()   // Formatted report
  └─ reset()            // Reset tracker

// Convenience Functions
canAffordFix()          // Quick check
recordFixCost()         // Quick log
getCostStats()          // Quick stats
generateCostReport()    // Quick report
```

#### 5. `validation-schemas.js` - Type Safety

**Responsibilities**:
- Define Zod schemas
- Validate data structures
- Provide safe parsing

**Key Schemas**:
```javascript
// Schemas
BugFixResultSchema      // Fix result validation
TestOutputSchema        // Test output validation
ConfigSchema            // Configuration validation
CIResultSchema          // CI result validation
CLIArgsSchema           // CLI args validation
GitOperationResultSchema // Git result validation

// Validation Functions
validateBugFixResult()  // Validate + throw
validateTestOutput()    // Validate + throw
validateConfig()        // Validate + throw
validateCIResult()      // Validate + throw

// Safe Parsing (No Exceptions)
safeParseBugFixResult() // Validate safely
safeParseTestOutput()   // Validate safely
safeParseConfig()       // Validate safely
safeParseCIResult()     // Validate safely
```

## Data Flow

### 1. Single File Fix Flow

```
CLI Input → parseCliArgs()
    ↓
fileExists() check
    ↓
readFileContent()
    ↓
estimateFixCost() → isWithinLimits()
    ↓
buildBugFixPrompt()
    ↓
analyzeAndFix() (AI API call)
    ↓
extractCleanCode()
    ↓
writeFileContent()
    ↓
runTests()
    ↓
Success? → createSuccessResult() : rollback + createErrorResult()
    ↓
validateBugFixResult()
    ↓
Return result
```

### 2. CI Auto-Fix Flow

```
runCIFix()
    ↓
createCIConfig()
    ↓
runTests() → Failed?
    ↓
parseTestOutput()
    ↓
validateTestOutput()
    ↓
identifyFilesToFix()
    ↓
For each file:
  ├─ fixBug() → applyAndTest()
  └─ Collect results
    ↓
createCIResult()
    ↓
autoCommit? → commitFixes()
  ├─ configureGit()
  ├─ stageChanges()
  ├─ commitChanges()
  └─ pushChanges() (if autoPush)
    ↓
Return CI result
```

### 3. Cost Tracking Flow

```
createCostTracker() (Factory)
    ↓
Private state initialized:
  ├─ dailySpend = 0
  ├─ fixCount = 0
  └─ lastReset = today
    ↓
Public API (frozen):
  ├─ recordFix(cost)
  ├─ canAfford(estimatedCost)
  ├─ getStats()
  ├─ generateReport()
  └─ reset()
    ↓
Each operation:
  ├─ checkAndResetDaily()
  ├─ Update private state
  └─ Return frozen result
```

## Design Patterns

### 1. Factory Pattern

Used for state management with closures:

```javascript
export const createCostTracker = (options = {}) => {
  // Private state (closure)
  let dailySpend = 0;
  let fixCount = 0;
  
  // Public API (frozen)
  return Object.freeze({
    recordFix: (cost) => {
      dailySpend += cost;
      return Object.freeze({ dailySpend });
    },
    getStats: () => Object.freeze({ dailySpend, fixCount }),
  });
};
```

### 2. Result Pattern

Consistent result objects for all operations:

```javascript
// Success result
{
  success: true,
  data: { /* successful data */ },
  timestamp: '2024-11-10T...',
}

// Error result
{
  success: false,
  error: 'Error message',
  timestamp: '2024-11-10T...',
}
```

### 3. Composition Pattern

Build complex behavior from simple functions:

```javascript
// Simple functions
const parseOutput = (output) => { /* ... */ };
const identifyFiles = (parsed) => { /* ... */ };
const fixFile = (file) => { /* ... */ };

// Composed orchestration
const fixAllIssues = (testOutput) => {
  const parsed = parseOutput(testOutput);
  const files = identifyFiles(parsed);
  return Promise.all(files.map(fixFile));
};
```

### 4. Validation Pattern

Runtime type safety with Zod:

```javascript
// Define schema
const ResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
});

// Validate data
const result = createResult(/* ... */);
const validation = ResultSchema.safeParse(result);

if (!validation.success) {
  console.warn('Validation failed:', validation.error);
}
```

## Testing Strategy

### Unit Tests

Each module has comprehensive unit tests:

- **Pure Functions**: Test with various inputs, verify immutability
- **Side Effects**: Mock external dependencies (fs, child_process, API)
- **State Management**: Test factory pattern, verify encapsulation
- **Validation**: Test schemas with valid/invalid data

### Test Structure

```javascript
describe('Module Name', () => {
  describe('Pure Functions', () => {
    it('should return same output for same input', () => {});
    it('should not mutate inputs', () => {});
    it('should return frozen objects', () => {});
  });
  
  describe('Side Effects', () => {
    it('should handle errors gracefully', () => {});
    it('should return frozen results', () => {});
  });
  
  describe('State Management', () => {
    it('should encapsulate private state', () => {});
    it('should prevent external mutation', () => {});
  });
});
```

## Performance Considerations

### 1. Cost Optimization

- Use `gpt-4o-mini` by default (80% cheaper than gpt-4o)
- Implement daily and per-fix cost limits
- Estimate costs before API calls
- Track and report spending

### 2. Parallel Processing

- Fix multiple files in parallel with `Promise.all()`
- Maintain immutability during parallel operations
- Collect results without mutation

### 3. Memory Management

- Use `Object.freeze()` for immutability without copying
- Avoid large object mutations
- Clean up temporary files after operations

## Security Considerations

### 1. API Key Management

- Store in environment variables
- Never commit to version control
- Rotate keys regularly

### 2. Input Validation

- Validate all user inputs
- Sanitize file paths
- Validate test outputs

### 3. Cost Protection

- Enforce spending limits
- Warn on high-cost operations
- Track daily spending

## Future Enhancements

### Potential Improvements

1. **Multi-Model Support** - Add Anthropic, Gemini models
2. **Caching** - Cache AI responses for similar bugs
3. **Learning** - Learn from successful fixes
4. **Rollback History** - Maintain fix history for rollbacks
5. **Custom Prompts** - Allow user-defined prompts
6. **Parallel CI Fixes** - Fix multiple files simultaneously in CI

### Maintaining FP Principles

All future enhancements should:
- Maintain pure function approach
- Use `Object.freeze()` for immutability
- Isolate side effects
- Provide comprehensive tests
- Follow existing patterns

---

**Last Updated**: v2.0.0 (2024-11-10)
