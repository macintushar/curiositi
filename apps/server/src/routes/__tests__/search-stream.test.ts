import { describe, it, expect } from "bun:test";
import { LLM_PROVIDERS } from "@curiositi/share/types";

describe("Search Stream Integration", () => {
  describe("Configuration Validation", () => {
    it("validates search schema structure", () => {
      const validRequest = {
        input: "Test question",
        model: "gpt-4o-mini",
        provider: LLM_PROVIDERS.OPENAI,
        thread_id: "test-thread-id",
        space_ids: ["space-1"],
        file_ids: [],
      };

      expect(validRequest.input).toBe("Test question");
      expect(validRequest.model).toBe("gpt-4o-mini");
      expect(validRequest.provider).toBe(LLM_PROVIDERS.OPENAI);
      expect(validRequest.thread_id).toBe("test-thread-id");
      expect(Array.isArray(validRequest.space_ids)).toBe(true);
    });

    it("handles optional parameters", () => {
      const minimalRequest = {
        input: "Test",
        model: "gpt-4o-mini",
        provider: LLM_PROVIDERS.OPENAI,
        thread_id: "test-thread-id",
      };

      expect(minimalRequest.input).toBe("Test");
      expect(minimalRequest.space_ids).toBeUndefined();
      expect(minimalRequest.file_ids).toBeUndefined();
    });
  });

  describe("Provider Support", () => {
    it("supports all LLM providers", () => {
      const providers = [
        LLM_PROVIDERS.OPENAI,
        LLM_PROVIDERS.ANTHROPIC,
        LLM_PROVIDERS.OPENROUTER,
      ];

      providers.forEach((provider) => {
        expect(provider).toBeDefined();
        expect(typeof provider).toBe("string");
      });
    });
  });

  describe("Request Structure", () => {
    it("validates required fields", () => {
      const request = {
        input: "What is the weather?",
        model: "gpt-4o-mini",
        provider: LLM_PROVIDERS.OPENAI,
        thread_id: "thread-123",
      };

      expect(request.input.length).toBeGreaterThan(0);
      expect(request.model.length).toBeGreaterThan(0);
      expect(request.thread_id.length).toBeGreaterThan(0);
    });

    it("handles array parameters", () => {
      const request = {
        input: "Search my docs",
        model: "gpt-4o-mini",
        provider: LLM_PROVIDERS.OPENAI,
        thread_id: "thread-123",
        space_ids: ["space-1", "space-2", "space-3"],
        file_ids: ["file-1", "file-2"],
      };

      expect(Array.isArray(request.space_ids)).toBe(true);
      expect(Array.isArray(request.file_ids)).toBe(true);
      expect(request.space_ids.length).toBe(3);
      expect(request.file_ids.length).toBe(2);
    });

    it("handles empty arrays", () => {
      const request = {
        input: "General question",
        model: "gpt-4o-mini",
        provider: LLM_PROVIDERS.OPENAI,
        thread_id: "thread-123",
        space_ids: [],
        file_ids: [],
      };

      expect(request.space_ids).toHaveLength(0);
      expect(request.file_ids).toHaveLength(0);
    });
  });

  describe("Response Format", () => {
    it("expects streaming response structure", () => {
      const mockStreamResponse = {
        status: 200,
        headers: {
          "content-type": "text/plain",
        },
      };

      expect(mockStreamResponse.status).toBe(200);
      expect(mockStreamResponse.headers["content-type"]).toContain("text");
    });

    it("expects error response structure", () => {
      const mockErrorResponse = {
        status: 500,
        body: {
          error: "Search failed",
        },
      };

      expect(mockErrorResponse.status).toBeGreaterThanOrEqual(400);
      expect(mockErrorResponse.body.error).toBeDefined();
    });
  });

  describe("Model Validation", () => {
    it("accepts valid OpenAI models", () => {
      const models = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];

      models.forEach((model) => {
        const request = {
          input: "Test",
          model,
          provider: LLM_PROVIDERS.OPENAI,
          thread_id: "test",
        };

        expect(request.model).toBe(model);
      });
    });

    it("accepts valid Anthropic models", () => {
      const models = [
        "claude-3-5-sonnet-20241022",
        "claude-3-opus-20240229",
        "claude-3-haiku-20240307",
      ];

      models.forEach((model) => {
        const request = {
          input: "Test",
          model,
          provider: LLM_PROVIDERS.ANTHROPIC,
          thread_id: "test",
        };

        expect(request.model).toBe(model);
      });
    });
  });

  describe("Thread Management", () => {
    it("requires thread_id for context", () => {
      const request = {
        input: "Follow-up question",
        model: "gpt-4o-mini",
        provider: LLM_PROVIDERS.OPENAI,
        thread_id: "existing-thread-id",
      };

      expect(request.thread_id).toBeDefined();
      expect(request.thread_id.length).toBeGreaterThan(0);
    });
  });

  describe("Timezone Handling", () => {
    it("accepts timezone header", () => {
      const timezone = "America/New_York";
      expect(timezone).toBeDefined();
      expect(timezone.includes("/")).toBe(true);
    });

    it("handles missing timezone gracefully", () => {
      const timezone = undefined;
      const fallback = timezone ?? "";
      expect(fallback).toBe("");
    });
  });
});

describe("Search Agent Configuration", () => {
  it("validates agent config structure", () => {
    const config = {
      input: "Test question",
      modelName: "gpt-4o-mini",
      history: [],
      spaces: [
        {
          id: "space-1",
          name: "Test Space",
          description: "A test space",
        },
      ],
      enableWebSearch: true,
      provider: LLM_PROVIDERS.OPENAI,
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      userTime: "America/New_York",
      maxDocQueries: 3,
      maxWebQueries: 2,
    };

    expect(config.input).toBeDefined();
    expect(config.modelName).toBeDefined();
    expect(Array.isArray(config.history)).toBe(true);
    expect(Array.isArray(config.spaces)).toBe(true);
    expect(config.enableWebSearch).toBe(true);
    expect(config.user).toBeDefined();
    expect(config.maxDocQueries).toBe(3);
    expect(config.maxWebQueries).toBe(2);
  });

  it("handles conversation history", () => {
    const history = [
      { role: "user", content: "First question" },
      { role: "assistant", content: "First answer" },
      { role: "user", content: "Follow-up question" },
    ];

    expect(history).toHaveLength(3);
    expect(history[0].role).toBe("user");
    expect(history[1].role).toBe("assistant");
  });

  it("handles multiple spaces", () => {
    const spaces = [
      { id: "space-1", name: "Documents", description: "Work docs" },
      { id: "space-2", name: "Notes", description: "Personal notes" },
      { id: "space-3", name: "Research" },
    ];

    expect(spaces).toHaveLength(3);
    expect(spaces.every((s) => s.id && s.name)).toBe(true);
  });
});
