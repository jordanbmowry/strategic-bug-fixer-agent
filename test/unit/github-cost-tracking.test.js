/**
 * Integration tests for GitHub cost tracking in bug fixer
 *
 * Tests that cost tracking is properly integrated and called during AI operations.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock GitHub cost tracker - use dynamic import to avoid export issues
const mockCreateGitHubCostTracker = vi.fn();
vi.mock("@jordanbmowry/agent-configuration/github-cost-tracker", async () => {
	const actual = await vi.importActual("@jordanbmowry/agent-configuration/github-cost-tracker");
	return {
		...actual,
		createGitHubCostTracker: (...args) => mockCreateGitHubCostTracker(...args),
	};
});

// Mock AI SDK
vi.mock("@ai-sdk/openai", () => ({
	openai: vi.fn(() => "mocked-model"),
}));

vi.mock("ai", () => ({
	generateText: vi.fn(),
}));

// Mock config adapter
vi.mock("../../src/config-adapter.js", () => ({
	buildBugFixPrompt: vi.fn(() => "test prompt"),
	getConfig: vi.fn(() => ({
		model: "gpt-4o-mini",
		maxTokens: 2000,
		temperature: 0.3,
	})),
	shouldSkipBugFix: vi.fn(() => false),
	isBugFixerEnabled: vi.fn(() => true),
}));

// Mock cost monitor
vi.mock("@jordanbmowry/agent-configuration/cost-monitor", () => ({
	estimateCost: vi.fn(() => 0.001),
	isWithinLimits: vi.fn(() => ({ allowed: true })),
}));

import { generateText } from "ai";
import { analyzeAndFix } from "../../src/bug-fixer.js";

describe("GitHub Cost Tracking Integration - Bug Fixer", () => {
	let mockCostTracker;
	let mockTrackCost;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Setup mock cost tracker
		mockTrackCost = vi.fn().mockResolvedValue({
			cost: 0.0004,
			monthlyTotal: 0.0004,
			tracked: true,
		});

		mockCostTracker = {
			trackCost: mockTrackCost,
			isAvailable: vi.fn(() => true),
		};

		mockCreateGitHubCostTracker.mockReturnValue(mockCostTracker);

		// Setup mock AI response
		generateText.mockResolvedValue({
			text: "```javascript\nconst fixed = true;\n```",
			usage: {
				promptTokens: 100,
				completionTokens: 50,
			},
		});
	});

	it("should track cost in GitHub when AI operation completes", async () => {
		const code = "const bug = true;";
		const filename = "test.js";
		const errorMessage = "Test error";

		await analyzeAndFix(code, filename, errorMessage, {
			model: "gpt-4o-mini",
			maxTokens: 2000,
			temperature: 0.3,
		});

		// Verify cost tracker was created
		expect(mockCreateGitHubCostTracker).toHaveBeenCalled();

		// Verify cost was tracked
		expect(mockTrackCost).toHaveBeenCalledWith(
			"bugFixer",
			100, // promptTokens
			50, // completionTokens
			"gpt-4o-mini",
		);
	});

	it("should not track cost when GitHub tracker is not available", async () => {
		mockCostTracker.isAvailable = vi.fn(() => false);

		const code = "const bug = true;";
		const filename = "test.js";
		const errorMessage = "Test error";

		await analyzeAndFix(code, filename, errorMessage, {
			model: "gpt-4o-mini",
			maxTokens: 2000,
			temperature: 0.3,
		});

		// Cost tracker should still be created
		expect(mockCreateGitHubCostTracker).toHaveBeenCalled();

		// But cost should not be tracked
		expect(mockTrackCost).not.toHaveBeenCalled();
	});

	it("should not track cost when usage is missing", async () => {
		generateText.mockResolvedValue({
			text: "```javascript\nconst fixed = true;\n```",
			// No usage object
		});

		const code = "const bug = true;";
		const filename = "test.js";
		const errorMessage = "Test error";

		await analyzeAndFix(code, filename, errorMessage, {
			model: "gpt-4o-mini",
			maxTokens: 2000,
			temperature: 0.3,
		});

		// Cost should not be tracked without usage
		expect(mockTrackCost).not.toHaveBeenCalled();
	});

	it("should handle cost tracking errors gracefully", async () => {
		mockTrackCost.mockRejectedValue(new Error("GitHub API error"));

		const code = "const bug = true;";
		const filename = "test.js";
		const errorMessage = "Test error";

		// Should not throw, just log warning
		await expect(
			analyzeAndFix(code, filename, errorMessage, {
				model: "gpt-4o-mini",
				maxTokens: 2000,
				temperature: 0.3,
			}),
		).resolves.toBeDefined();

		// Cost tracking should have been attempted
		expect(mockTrackCost).toHaveBeenCalled();
	});

	it("should use correct agent name for tracking", async () => {
		const code = "const bug = true;";
		const filename = "test.js";
		const errorMessage = "Test error";

		await analyzeAndFix(code, filename, errorMessage, {
			model: "gpt-4o-mini",
			maxTokens: 2000,
			temperature: 0.3,
		});

		// Verify agent name is "bugFixer"
		expect(mockTrackCost).toHaveBeenCalledWith(
			"bugFixer",
			expect.any(Number),
			expect.any(Number),
			expect.any(String),
		);
	});

	it("should pass correct token counts to tracker", async () => {
		const mockUsage = {
			promptTokens: 500,
			completionTokens: 300,
		};

		generateText.mockResolvedValue({
			text: "```javascript\nconst fixed = true;\n```",
			usage: mockUsage,
		});

		const code = "const bug = true;";
		const filename = "test.js";
		const errorMessage = "Test error";

		await analyzeAndFix(code, filename, errorMessage, {
			model: "gpt-4o-mini",
			maxTokens: 2000,
			temperature: 0.3,
		});

		// Verify exact token counts
		expect(mockTrackCost).toHaveBeenCalledWith(
			"bugFixer",
			500,
			300,
			"gpt-4o-mini",
		);
	});
});

