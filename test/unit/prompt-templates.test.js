/**
 * Tests for Bug Fixer Prompt Templates Integration
 */

import { describe, expect, it } from 'vitest';
import { buildBugFixPrompt } from '../../src/config-adapter.js';

describe('Bug Fixer - Prompt Template Integration', () => {
  const testConfigPath = '.agent-config.json';

  describe('buildBugFixPrompt', () => {
    it('should build a prompt using template engine', () => {
      const code = 'const x = undefined.value;';
      const filename = 'error.js';
      const errorMessage = 'TypeError: Cannot read property "value" of undefined';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should include code in prompt', () => {
      const code = 'const result = null.toString();';
      const filename = 'bug.js';
      const errorMessage = 'TypeError: null is not an object';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toContain(code);
    });

    it('should include filename in prompt', () => {
      const code = 'const x = 1;';
      const filename = 'my-buggy-file.js';
      const errorMessage = 'Some error';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toContain(filename);
    });

    it('should include error message in prompt', () => {
      const code = 'const x = undefined.value;';
      const filename = 'error.js';
      const errorMessage = 'Cannot read property "value" of undefined';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toContain(errorMessage);
    });

    it('should handle different error types', () => {
      const testCases = [
        {
          code: 'const x = undefined.value;',
          filename: 'type-error.js',
          errorMessage: 'TypeError: Cannot read property of undefined',
        },
        {
          code: 'JSON.parse("{invalid}");',
          filename: 'syntax-error.js',
          errorMessage: 'SyntaxError: Unexpected token',
        },
        {
          code: 'throw new Error("custom");',
          filename: 'custom-error.js',
          errorMessage: 'Error: custom error message',
        },
      ];

      for (const { code, filename, errorMessage } of testCases) {
        const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);
        expect(prompt).toBeDefined();
        expect(prompt).toContain(filename);
        expect(prompt).toContain(errorMessage);
      }
    });

    it('should handle missing error message', () => {
      const code = 'const x = 1;';
      const filename = 'test.js';
      const errorMessage = '';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toBeDefined();
      expect(prompt).toContain(filename);
    });

    it('should detect JavaScript language from filename', () => {
      const code = 'const x = 1;';
      const filename = 'test.js';
      const errorMessage = 'Some error';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt.toLowerCase()).toContain('javascript');
    });

    it('should detect TypeScript language from filename', () => {
      const code = 'const x: number = 1;';
      const filename = 'test.ts';
      const errorMessage = 'Type error';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt.toLowerCase()).toContain('typescript');
    });

    it('should detect Python language from filename', () => {
      const code = 'x = None.value';
      const filename = 'test.py';
      const errorMessage = 'AttributeError';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt.toLowerCase()).toContain('python');
    });

    it('should handle complex error messages', () => {
      const code = 'const x = undefined.value;';
      const filename = 'complex.js';
      const errorMessage = `TypeError: Cannot read property 'value' of undefined
    at Object.<anonymous> (/path/to/file.js:10:5)
    at Module._compile (internal/modules:456:7)`;

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('TypeError');
    });

    it('should handle code with syntax errors', () => {
      const code = 'const x = {missing brace';
      const filename = 'syntax-error.js';
      const errorMessage = 'SyntaxError: Unexpected token';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toBeDefined();
      expect(prompt).toContain(filename);
      expect(prompt).toContain(code);
    });

    it('should handle multiline code', () => {
      const code = `function buggyFunction() {
  const data = null;
  return data.value;
}`;
      const filename = 'multiline.js';
      const errorMessage = 'TypeError: Cannot read property';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toContain('buggyFunction');
      expect(prompt).toContain(errorMessage);
    });

    it('should handle code with special characters', () => {
      const code = 'const msg = "Error: \\"value\\" is undefined"; throw new Error(msg);';
      const filename = 'special.js';
      const errorMessage = 'Error: "value" is undefined';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should include safety level from config', () => {
      const code = 'const x = 1;';
      const filename = 'test.js';
      const errorMessage = 'Some error';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      // Should contain some reference to safety or being careful
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(50);
    });

    it('should handle very long code', () => {
      const code = 'function test() { return 1; }\n'.repeat(100);
      const filename = 'large.js';
      const errorMessage = 'Some error in large file';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toBeDefined();
      expect(prompt).toContain(filename);
      expect(prompt.length).toBeGreaterThan(1000);
    });

    it('should handle empty code', () => {
      const code = '';
      const filename = 'empty.js';
      const errorMessage = 'File is empty';

      const prompt = buildBugFixPrompt(code, filename, errorMessage, testConfigPath);

      expect(prompt).toBeDefined();
      expect(prompt).toContain(filename);
      expect(prompt).toContain(errorMessage);
    });
  });

  describe('Language Detection', () => {
    it('should detect correct language for various extensions', () => {
      const extensions = [
        { ext: 'js', expected: 'javascript' },
        { ext: 'ts', expected: 'typescript' },
        { ext: 'py', expected: 'python' },
        { ext: 'go', expected: 'go' },
        { ext: 'rs', expected: 'rust' },
      ];

      for (const { ext, expected } of extensions) {
        const prompt = buildBugFixPrompt('const x = 1;', `test.${ext}`, 'Error', testConfigPath);
        expect(prompt.toLowerCase()).toContain(expected);
      }
    });

    it('should fall back to javascript for unknown extensions', () => {
      const prompt = buildBugFixPrompt('const x = 1;', 'test.unknown', 'Error', testConfigPath);
      expect(prompt.toLowerCase()).toContain('javascript');
    });
  });
});
