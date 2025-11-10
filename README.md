# Strategic Bug Fixer Agent v2.0

> 🤖 AI-powered bug detection and fixing agent with functional programming architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-orange)](https://pnpm.io/)

## 📋 Overview

Strategic Bug Fixer Agent is an intelligent debugging tool that uses OpenAI's GPT models to automatically detect and fix bugs in your codebase. Built with **functional programming principles**, it provides cost-effective, reliable bug fixes with comprehensive tracking and validation.

### Key Features

- 🔍 **Intelligent Bug Detection** - Analyzes code and test failures to identify issues
- 🔧 **Automated Fixes** - Generates and applies targeted bug fixes
- ✅ **Test Validation** - Automatically tests fixes before committing
- 💰 **Cost Monitoring** - Built-in budget tracking and limits ($10/day, $2/fix)
- 🚀 **CI/CD Integration** - Works seamlessly in GitHub Actions
- 🛡️ **Type Safety** - Zod validation for all operations
- ⚡ **Functional Architecture** - Pure functions, immutability, composition

### What's New in v2.0

- ✨ Complete refactor to functional programming principles
- 📊 Advanced cost monitoring with real-time tracking
- 🔒 Type-safe validation with Zod schemas
- 🧪 Comprehensive test suite with Vitest
- 🎨 Biome linting and formatting
- 📚 Enhanced documentation and examples

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20.0.0
- pnpm ≥ 10.0.0
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/strategic-bug-fixer-agent.git
cd strategic-bug-fixer-agent

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Basic Usage

```bash
# Fix a specific file
pnpm fix-bug src/payment.js

# Fix with error context
pnpm fix-bug src/utils.js "Cannot read property of undefined"

# Run CI auto-fix (checks tests, fixes failures)
pnpm ci-fix
```

## 📖 Usage Examples

### 1. Fix a Single File

```javascript
import { fixBug } from './src/bug-fixer.js';

const result = await fixBug('src/payment.js', 'ReferenceError: total is not defined');

if (result.success) {
  console.log(`Fixed! Changed ${result.linesChanged} lines`);
  console.log(`Model used: ${result.model}`);
}
```

### 2. Fix Multiple Files in Parallel

```javascript
import { fixBugsParallel } from './src/bug-fixer.js';

const fixes = [
  { filename: 'src/cart.js', errorMessage: 'TypeError: Cannot read property' },
  { filename: 'src/checkout.js', errorMessage: 'ReferenceError: price is not defined' },
];

const results = await fixBugsParallel(fixes);
console.log(`Fixed ${results.filter(r => r.success).length} out of ${results.length}`);
```

### 3. CI/CD Integration

```javascript
import { runCIFixWithRetries } from './src/ci-bug-fixer.js';

const result = await runCIFixWithRetries({
  maxRetries: 3,
  autoCommit: true,
  autoPush: false,
  configType: 'thorough',
});

console.log(`Successful fixes: ${result.successful}`);
console.log(`Tests passing: ${result.finalTestsPassed}`);
```

### 4. Custom Configuration

```javascript
import { fixBug, createCustomConfig } from './src/bug-fixer.js';

const result = await fixBug('src/api.js', '', {
  model: 'gpt-4o',
  maxTokens: 4000,
  temperature: 0.1,
  configType: 'security',
});
```

### 5. Cost Monitoring

```javascript
import { 
  estimateFixCost, 
  createCostTracker,
  generateCostReport 
} from './src/cost-monitor.js';

// Estimate cost before fixing
const code = readFileSync('src/app.js', 'utf8');
const estimatedCost = estimateFixCost(code.length, 2000, 'gpt-4o-mini');
console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);

// Track costs
const tracker = createCostTracker({ dailyLimit: 10.0 });
const canAfford = tracker.canAfford(estimatedCost);

if (canAfford.allowed) {
  // Proceed with fix
  const result = await fixBug('src/app.js');
  tracker.recordFix(estimatedCost);
  
  console.log(tracker.generateReport());
}
```

## 🏗️ Architecture

This project follows **strict functional programming principles**:

### Core Principles

1. **Pure Functions** - No side effects, deterministic outputs
2. **Immutability** - All data structures frozen with `Object.freeze()`
3. **Composition** - Build complex behavior from simple functions
4. **Isolated Side Effects** - File I/O, API calls, git operations isolated
5. **Type Safety** - Runtime validation with Zod schemas

### Module Structure

```
src/
├── bug-fixer.js         # Core bug fixing logic (pure functions)
├── ci-bug-fixer.js      # CI/CD integration (orchestration)
├── config.js            # Configuration presets (immutable)
├── cost-monitor.js      # Cost tracking (factory pattern)
└── validation-schemas.js # Type validation (Zod schemas)
```

### Data Flow

```
Test Failure → Parse Output → Identify Files → Analyze Code
     ↓              ↓              ↓              ↓
Cost Check → AI Fix → Apply → Test → Commit (if success)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.

## 📊 Configuration

### Available Configurations

- **quick** - Fast, cost-effective (gpt-4o-mini, 1500 tokens, $0.0001/fix)
- **thorough** - Balanced quality (gpt-4o-mini, 3000 tokens, $0.0002/fix)
- **security** - Security-focused (gpt-4o, 4000 tokens, $0.05/fix)
- **performance** - Performance optimization (gpt-4o, 3500 tokens, $0.04/fix)

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-your-key-here

# Optional (with defaults)
DAILY_COST_LIMIT=10.0          # Daily spending limit
PER_FIX_COST_LIMIT=2.0         # Per-fix spending limit
DEFAULT_MODEL=gpt-4o-mini      # Default AI model
DEFAULT_CONFIG_TYPE=quick      # Default configuration
TEST_COMMAND=npm test          # Test command
AUTO_COMMIT=true               # Auto-commit fixes in CI
AUTO_PUSH=false                # Auto-push fixes in CI
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Test Coverage

- ✅ Configuration management (pure functions)
- ✅ Cost monitoring (state management)
- ✅ Validation schemas (Zod integration)
- ✅ All modules follow functional programming principles

## 🎨 Code Quality

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm typecheck
```

### Standards

- **Linting**: Biome with strict rules
- **Formatting**: 2-space indentation, single quotes, semicolons
- **Imports**: Node.js protocol (`node:fs`, `node:path`)
- **Complexity**: Maximum cognitive complexity enforced

## 💰 Cost Management

### Default Limits

- **Daily Limit**: $10.00 USD
- **Per-Fix Limit**: $2.00 USD
- **Model**: gpt-4o-mini (cost-optimized)

### Typical Costs

| Operation | Estimated Cost |
|-----------|---------------|
| Quick fix (simple bug) | $0.0001 - $0.001 |
| Thorough fix (complex bug) | $0.001 - $0.01 |
| Security fix (gpt-4o) | $0.01 - $0.10 |
| CI auto-fix (3 files) | $0.001 - $0.05 |

### Cost Tracking

The cost monitor automatically tracks:
- Daily spending
- Per-fix costs
- Average cost per fix
- Remaining budget
- Warning thresholds

## 🔧 CI/CD Integration

### GitHub Actions Setup

```yaml
name: Auto Bug Fix

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - run: pnpm install
      
      - name: Run bug fixer
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: pnpm ci-fix
```

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture and design patterns
- [USAGE.md](./USAGE.md) - Comprehensive usage examples
- [CHANGELOG.md](./CHANGELOG.md) - Version history and changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m '✨ Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow functional programming principles
- Write pure functions with no side effects
- Use `Object.freeze()` for immutability
- Add unit tests for new features
- Update documentation
- Run `pnpm lint:fix` before committing

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- OpenAI for GPT models and AI SDK
- Vercel for AI SDK
- Biome for linting and formatting
- Vitest for testing framework
- Zod for runtime type validation

## 📞 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/strategic-bug-fixer-agent/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/strategic-bug-fixer-agent/discussions)

---

**Built with ❤️ using functional programming principles**
