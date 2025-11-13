# Strategic Bug Fixer Agent - Copilot Instructions

## Project Context
AI-powered bug detection and fixing agent using functional programming principles. Automatically detects and fixes bugs with cost monitoring and CI/CD integration.

## Coding Standards

### Functional Programming
- Always use pure functions with no side effects
- Use `Object.freeze()` for all configurations
- Prefer composition over classes
- Isolate side effects (file I/O, git, AI API calls) from business logic

### Code Style
- Use single quotes for strings
- Use spaces for indentation (width 2)
- Maximum line width: 100 characters
- Always use semicolons
- Use Node.js protocol for built-in modules: `node:fs`, `node:path`, `node:url`, etc.

### Type Safety
- Use JSDoc types for all functions
- Use Zod schemas for runtime validation
- Avoid `any` - use `unknown` with type guards

### Bug Fixing
- Always validate fixes with test commands before committing
- Support multiple fix strategies: quick, thorough, security, performance
- Track costs for each operation
- Respect daily ($10) and per-fix ($2) cost limits

### Cost Management
- Default to `gpt-4o-mini` for cost-effective fixes
- Always estimate costs before running fixes
- Track costs with cost monitor
- Never exceed configured limits

### Testing
- Mock AI API calls to prevent costs
- Mock file system operations
- Write unit tests for all pure functions
- Use Vitest for testing

### Configuration
- Load from `.agent-config.json` if available
- Support prompt templates for customizing AI behavior
- Use configuration adapter from `@jordanbmowry/agent-configuration`

## Common Tasks

When fixing bugs:
- Analyze code and error messages
- Generate targeted fixes
- Validate fixes with test commands
- Track costs and respect limits

When writing tests:
- Always mock AI API calls
- Mock file system operations
- Test pure functions in isolation

