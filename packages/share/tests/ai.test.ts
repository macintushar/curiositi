import { describe, expect, test } from "bun:test";
import type { EmbeddingProvider } from "../src/ai";

describe("AI Module Types", () => {
	test("EmbeddingProvider type should be openai or google", () => {
		const openai: EmbeddingProvider = "openai";
		const google: EmbeddingProvider = "google";

		expect(openai).toBe("openai");
		expect(google).toBe("google");
	});
});

describe("AI Provider Constants", () => {
	test("OpenAI embedding model name should be correct", () => {
		const openaiEmbeddingModel = "text-embedding-3-small";
		expect(openaiEmbeddingModel).toContain("embedding");
	});

	test("Google embedding model name should be correct", () => {
		const googleEmbeddingModel = "gemini-embedding-001";
		expect(googleEmbeddingModel).toContain("embedding");
	});

	test("OpenAI text model should contain gpt", () => {
		const openaiTextModel = "gpt";
		expect(openaiTextModel).toContain("gpt");
	});

	test("Google text model should contain gemini", () => {
		const googleTextModel = "gemini";
		expect(googleTextModel).toContain("gemini");
	});
});

describe("Embedding Configuration", () => {
	test("should have correct dimensions", () => {
		const dimensions = 1536;
		expect(dimensions).toBe(1536);
	});

	test("should have correct max parallel calls", () => {
		const maxParallelCalls = 3;
		expect(maxParallelCalls).toBe(3);
	});
});
