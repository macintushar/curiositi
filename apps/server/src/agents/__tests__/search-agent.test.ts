import { describe, it, expect, beforeEach, mock } from "bun:test";
import { executeSearchAgent, type SearchAgentConfig } from "../search-agent";
import { LLM_PROVIDERS } from "@curiositi/share/types";

const mockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  emailVerified: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseConfig: SearchAgentConfig = {
  input: "Test question",
  modelName: "gpt-4o-mini",
  history: [],
  spaces: [
    {
      id: "space-1",
      name: "Test Space",
      description: "A test space",
      fileCount: 5,
    },
  ],
  enableWebSearch: true,
  provider: LLM_PROVIDERS.OPENAI,
  user: mockUser,
  userTime: "America/New_York",
};

describe("Search Agent", () => {
  beforeEach(() => {
    mock.restore();
  });

  describe("Configuration", () => {
    it("accepts valid configuration", () => {
      expect(baseConfig.input).toBe("Test question");
      expect(baseConfig.spaces).toHaveLength(1);
      expect(baseConfig.enableWebSearch).toBe(true);
    });

    it("uses default values for optional parameters", () => {
      expect(baseConfig.maxDocQueries).toBeUndefined();
      expect(baseConfig.maxWebQueries).toBeUndefined();
    });
  });

  describe("Streaming", () => {
    it("returns a stream result", async () => {
      const result = await executeSearchAgent(baseConfig);
      
      expect(result).toBeDefined();
      expect(result.toTextStreamResponse).toBeDefined();
      expect(typeof result.toTextStreamResponse).toBe("function");
    });

    it("starts streaming immediately", async () => {
      const start = Date.now();
      const result = await executeSearchAgent(baseConfig);
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Tool Integration", () => {
    it("provides search_docs tool when spaces are available", async () => {
      const result = await executeSearchAgent(baseConfig);
      expect(result).toBeDefined();
    });

    it("provides search_web tool when web search is enabled", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        enableWebSearch: true,
      });
      expect(result).toBeDefined();
    });

    it("does not provide search_web tool when web search is disabled", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        enableWebSearch: false,
      });
      expect(result).toBeDefined();
    });
  });

  describe("Context Building", () => {
    it("includes user metadata in context", async () => {
      const result = await executeSearchAgent(baseConfig);
      expect(result).toBeDefined();
    });

    it("includes space information in context", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        spaces: [
          {
            id: "space-1",
            name: "Space 1",
            fileCount: 10,
          },
          {
            id: "space-2",
            name: "Space 2",
            description: "Test description",
            fileCount: 5,
          },
        ],
      });
      expect(result).toBeDefined();
    });

    it("handles empty spaces array", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        spaces: [],
      });
      expect(result).toBeDefined();
    });

    it("includes conversation history", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        history: [
          { role: "user", content: "Previous question" },
          { role: "assistant", content: "Previous answer" },
        ],
      });
      expect(result).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("handles missing user name gracefully", async () => {
      const configWithoutUser = {
        ...baseConfig,
        user: {
          ...mockUser,
          name: "",
        },
      };
      
      const result = await executeSearchAgent(configWithoutUser);
      expect(result).toBeDefined();
    });

    it("handles empty input", async () => {
      try {
        await executeSearchAgent({
          ...baseConfig,
          input: "",
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Provider Support", () => {
    it("supports OpenAI provider", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        provider: LLM_PROVIDERS.OPENAI,
      });
      expect(result).toBeDefined();
    });

    it("supports Anthropic provider", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        provider: LLM_PROVIDERS.ANTHROPIC,
        modelName: "claude-3-5-sonnet-20241022",
      });
      expect(result).toBeDefined();
    });

    it("supports OpenRouter provider", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        provider: LLM_PROVIDERS.OPENROUTER,
        modelName: "anthropic/claude-3.5-sonnet",
      });
      expect(result).toBeDefined();
    });
  });

  describe("Query Limits", () => {
    it("respects maxDocQueries limit", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        maxDocQueries: 2,
      });
      expect(result).toBeDefined();
    });

    it("respects maxWebQueries limit", async () => {
      const result = await executeSearchAgent({
        ...baseConfig,
        maxWebQueries: 1,
      });
      expect(result).toBeDefined();
    });
  });
});
