# Search Agent - Implementation Plan

## Overview

Transform Curiositi's current 6-step agent into a fast, Perplexity-style search agent that **streams responses immediately** while deciding whether to search or answer directly.

**Primary Goal**: Stream-first architecture - start streaming within 400ms
**Secondary Goal**: Reduce total response time by 62-92%

---

## Core Flow

```
User Question
    ↓
START STREAMING IMMEDIATELY (~100ms to first token)
    ↓
Search Agent (Background) - Structured Output
    ├─ Analyzes question + context
    ├─ Decides routing: direct | search_docs | search_web | search_hybrid
    └─ Generates search queries (if needed)
    ↓
    ┌─────────────────────┴─────────────────────┐
    │                                           │
  DIRECT                                    SEARCH
    │                                           │
Continue streaming                    Execute searches in parallel
answer from agent                      (background, non-blocking)
(already started)                                ↓
                                      Inject search results into stream
                                                 ↓
                                      Continue streaming with citations
```

**Key Insight**: We DON'T wait for the search agent to decide. We stream the answer generation IMMEDIATELY, and the agent's decision (direct vs search) just determines whether we inject search results mid-stream.

---

## Performance Comparison

### Current System (6 Sequential Steps)

| Step | Operation | Latency | Cumulative |
|------|-----------|---------|------------|
| 1 | Context Analysis | 500ms | 500ms |
| 2 | Query Generation | 400ms | 900ms |
| 3 | Information Gathering | 2000ms | 2900ms |
| 4 | Result Processing | 100ms | 3000ms |
| 5 | Context Building | 50ms | 3050ms |
| 6 | Response Generation | 2000ms | **~5050ms** |

**Time to first token: ~5050ms**
**LLM calls: 3** (context analysis, query gen, response gen)

### New System (Stream-First Architecture)

**All Paths:**
- Start streaming answer generation: **~100ms to first token**
- Search agent runs in parallel (non-blocking)
- If search needed: inject results into ongoing stream

**Direct Answer Path:**
- Stream starts: ~100ms
- Agent decides "direct": ~400ms (doesn't affect stream)
- Stream continues uninterrupted

**Search Path:**
- Stream starts: ~100ms
- Agent decides "search": ~400ms (doesn't affect stream)
- Searches execute: ~1500ms (results injected into stream)
- Stream continues with search context

**LLM calls: 1** (streaming answer generation, which also acts as search agent)
**Time to first token: ~100ms regardless of path** (95-98% faster)

---

## Phase 1: Streaming Architecture

### 1.1 Stream-First Design

**Critical Change**: Instead of "decide then stream", we "stream while deciding"

```typescript
// Tool call schema for search agent (embedded in stream)
type SearchToolCall = {
  tool: "search_docs" | "search_web" | "search_hybrid"
  queries: {
    doc?: string[]    // 1-3 doc queries
    web?: string[]    // 1-2 web queries
  }
  targetSpaces?: string[]  // Specific space IDs to search
}

// No separate "direct" decision - if no tool calls, it's direct
```

**How it works:**
1. Start streaming LLM response immediately
2. LLM can call search tools mid-generation (via function calling)
3. If tools called: pause stream → execute searches → inject results → continue stream
4. If no tools called: just stream the answer (direct path)

**Key advantages:**
- First token arrives in ~100ms (just LLM startup time)
- User sees progress immediately
- Search decisions don't block streaming
- Natural integration with function calling

### 1.2 Streaming Implementation

```typescript
import { streamText } from 'ai'

async function executeSearchAgent(
  question: string,
  history: Message[],
  spaces: SpaceMetadata[],
  user: User,
  enableWebSearch: boolean
) {
  const tokenBudget = 16000
  const context = buildContext(question, history, spaces, user, tokenBudget)
  
  // Define search tools (available to LLM during streaming)
  const tools = {
    search_docs: {
      description: 'Search user\'s uploaded documents',
      parameters: z.object({
        queries: z.array(z.string()).max(3),
        targetSpaces: z.array(z.string()).optional()
      }),
      execute: async ({ queries, targetSpaces }) => {
        const results = await executeDocSearches(queries, targetSpaces || spaces.map(s => s.id))
        return formatSearchResults(results)
      }
    },
    search_web: enableWebSearch ? {
      description: 'Search the internet for current information',
      parameters: z.object({
        queries: z.array(z.string()).max(2)
      }),
      execute: async ({ queries }) => {
        const results = await executeWebSearches(queries)
        return formatSearchResults(results)
      }
    } : undefined
  }
  
  // Start streaming immediately - LLM will call tools if needed
  const result = streamText({
    model: llm(modelName, provider),
    system: SEARCH_AGENT_SYSTEM_PROMPT,
    messages: [
      ...context.history,
      { role: 'user', content: buildUserPrompt(context) }
    ],
    tools,
    temperature: 0.6,
    maxToolRoundtrips: 2, // Allow search → answer flow
  })
  
  return result.toTextStreamResponse()
}
```

**Flow:**
1. `streamText()` starts immediately (~100ms)
2. LLM generates text OR calls search tool
3. If tool called: execute search, inject results, continue streaming
4. If no tool: just stream the answer
5. User sees tokens arriving throughout

### 1.3 Search Agent Prompt (Stream-Aware)

```typescript
const SEARCH_AGENT_SYSTEM_PROMPT = `You are an AI assistant for Curiositi, an AI-powered knowledge platform.

You have access to search tools to find information when needed. Use them intelligently:

AVAILABLE TOOLS:
- search_docs: Search user's uploaded documents (use when they reference "my files", space names, or need their data)
- search_web: Search the internet (use for current events, external info, or when docs don't have the answer)

WHEN TO SEARCH:
- User explicitly mentions their files/documents/spaces
- Question requires specific data likely in their uploads
- Need current/external information not in documents
- Comparing internal data with external sources

WHEN NOT TO SEARCH:
- Simple greetings, chitchat, or clarifications
- Basic calculations or definitions you're confident about
- General knowledge questions (95%+ confidence)
- Follow-up questions already answered in conversation

SEARCH STRATEGY:
- Call search tools EARLY (at start of response if needed)
- Generate 1-3 specific document queries, 1-2 web queries
- After getting results, synthesize them into your answer
- Cite sources naturally in your response

CRITICAL:
- Start answering immediately - don't wait to "plan"
- If you need to search, call the tool right away
- If you don't need to search, just answer directly
- Always be helpful and accurate`

const buildUserPrompt = (context: Context) => `
User: ${context.user.name} (${context.user.timezone})

Available document spaces (${context.spaces.length}):
${context.spaces.map(s => 
  `- "${s.name}" (${s.fileCount} files)${s.description ? `: ${s.description}` : ''}`
).join('\n')}

${context.question}`
```

**Key differences from old prompt:**
- No explicit "routing" - LLM just calls tools when needed
- Emphasizes starting immediately (streaming)
- Tool-first language (not decision-first)
- Simpler, more natural instructions

### 1.4 Search Tool Implementation

```typescript
async function executeDocSearches(
  queries: string[],
  spaceIds: string[]
): Promise<SearchResult[]> {
  const promises = spaceIds.flatMap(spaceId =>
    queries.map(query => docSearchToolWithSpaceId(query, spaceId))
  )
  
  const results = await Promise.allSettled(promises)
  
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .slice(0, 10) // Limit results
}

async function executeWebSearches(
  queries: string[]
): Promise<SearchResult[]> {
  const results = await Promise.allSettled(
    queries.map(query => webSearchTool.invoke(query))
  )
  
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .slice(0, 5)
}

function formatSearchResults(results: SearchResult[]): string {
  // Format for LLM consumption
  return results.map((r, i) => 
    `[${i+1}] ${r.title}\n${r.content}\nSource: ${r.source}`
  ).join('\n\n')
}
```

---

## Phase 2: Stream Integration

### 2.1 Unified Streaming Path

```typescript
// Single path - streaming handles both direct and search
async function streamAnswer(config: AgentConfig) {
  const stream = await executeSearchAgent(
    config.input,
    config.history,
    config.spaces,
    config.user,
    config.enableWebSearch
  )
  
  // Stream already started - just return it
  return stream
}
```

**That's it.** No separate paths needed. The LLM decides mid-stream whether to search.

### 2.2 Client-Side Handling

```typescript
// Client receives stream with potential tool calls
async function handleStreamResponse(response: Response) {
  const stream = response.body
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('0:')) {
        // Text chunk - display to user
        displayText(line.slice(2))
      } else if (line.startsWith('9:')) {
        // Tool call - show "Searching..." indicator
        showSearchingIndicator()
      } else if (line.startsWith('a:')) {
        // Tool result - hide indicator, continue text
        hideSearchingIndicator()
      }
    }
  }
}
```

**User experience:**
1. User asks question
2. Answer starts streaming immediately (~100ms)
3. If search needed: "🔍 Searching documents..." appears briefly
4. Search results injected, streaming continues
5. Answer completes with sources

---

## Phase 3: Migration Strategy

### 3.1 Feature Flag Approach

```typescript
const USE_SEARCH_AGENT = process.env.ENABLE_SEARCH_AGENT === 'true'

export async function executeAgent(config: AgentConfig) {
  if (USE_SEARCH_AGENT) {
    return newSearchAgent(config)
  } else {
    return legacyMultiStepAgent(config)
  }
}
```

### 3.2 A/B Testing

**Metrics to track:**
- Time to first token
- Total response time
- User satisfaction (thumbs up/down)
- Answer quality (manual review sample)
- Error rate
- Cost per query (LLM API costs)

**Success criteria:**
- **Time to first token: <200ms for 95th percentile** (streaming priority)
- Error rate: <5%
- User satisfaction: >85%
- Cost reduction: >40%

### 3.3 Rollout Plan

1. **Week 1**: Internal testing (dev team only)
2. **Week 2**: Beta users (10% of traffic)
3. **Week 3**: Gradual rollout (25% → 50% → 75%)
4. **Week 4**: Full rollout (100%) or rollback

---

## Phase 4: Edge Cases & Fallbacks

### 4.1 Stream Interruption Handling

```typescript
// If stream fails mid-generation
stream.on('error', async (error) => {
  console.error('Stream error:', error)
  
  // Send error message through stream
  yield encoder.encode('\n\n[Error: Connection interrupted. Please try again.]\n')
  
  // Log for debugging
  logStreamError(error, context)
})
```

### 4.2 Empty Search Results

```typescript
// In tool execution
async execute({ queries, targetSpaces }) {
  const results = await executeDocSearches(queries, targetSpaces)
  
  if (results.length === 0) {
    return "No relevant documents found. Continue with general knowledge."
  }
  
  return formatSearchResults(results)
}
```

LLM will see "No relevant documents found" and adapt its response accordingly (already mid-stream).

### 4.3 Tool Call Failures

```typescript
// If search tool fails during stream
tools: {
  search_docs: {
    execute: async ({ queries, targetSpaces }) => {
      try {
        const results = await executeDocSearches(queries, targetSpaces)
        return formatSearchResults(results)
      } catch (error) {
        console.error('Doc search failed:', error)
        // Return error message - LLM will handle gracefully in stream
        return `Error searching documents: ${error.message}. Continuing with available information.`
      }
    }
  }
}
```

LLM receives error message and continues streaming with a graceful fallback.

---

## Phase 5: Testing Strategy

### 5.1 Unit Tests (Target: >80% coverage)

**Test files:**
- `search-agent.test.ts` - Core streaming logic
- `search-tools.test.ts` - Doc/web search execution
- `context-builder.test.ts` - Token budget management
- `stream-parser.test.ts` - Client-side parsing

**Test cases:**
```typescript
describe('Search Agent', () => {
  it('starts streaming within 100ms', async () => {
    const start = Date.now()
    const stream = await executeSearchAgent(config)
    const firstChunk = await stream.read()
    expect(Date.now() - start).toBeLessThan(100)
  })
  
  it('calls search_docs when user mentions their files', async () => {
    const stream = await executeSearchAgent({
      input: "What's in my Q4 report?",
      ...config
    })
    const toolCalls = await extractToolCalls(stream)
    expect(toolCalls).toContain('search_docs')
  })
  
  it('does not search for simple questions', async () => {
    const stream = await executeSearchAgent({
      input: "What is 2+2?",
      ...config
    })
    const toolCalls = await extractToolCalls(stream)
    expect(toolCalls).toHaveLength(0)
  })
  
  it('handles search failures gracefully', async () => {
    mockDocSearch.mockRejectedValue(new Error('Search failed'))
    const stream = await executeSearchAgent(config)
    const text = await streamToText(stream)
    expect(text).toContain('general knowledge')
  })
})
```

### 5.2 Integration Tests (E2E Flow)

**Test scenarios:**
```typescript
describe('Search Agent E2E', () => {
  it('direct answer path: greeting', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello!' })
    
    expect(response.status).toBe(200)
    expect(response.body.stream).toBeDefined()
    
    const text = await consumeStream(response.body.stream)
    expect(text).toMatch(/hi|hello/i)
    expect(extractToolCalls(text)).toHaveLength(0)
  })
  
  it('document search path: user files', async () => {
    // Setup: Upload test document
    await uploadTestFile('Q4-report.pdf', spaceId)
    
    const response = await request(app)
      .post('/api/chat')
      .send({ message: "What's in my Q4 report?" })
    
    const { text, toolCalls, duration } = await analyzeStream(response.body.stream)
    
    expect(duration.firstToken).toBeLessThan(200)
    expect(toolCalls).toContain('search_docs')
    expect(text).toContain('Q4')
  })
  
  it('web search path: current events', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: "What's the weather today?" })
    
    const { toolCalls } = await analyzeStream(response.body.stream)
    expect(toolCalls).toContain('search_web')
  })
  
  it('hybrid search path: comparison', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: "Compare my sales to industry average" })
    
    const { toolCalls } = await analyzeStream(response.body.stream)
    expect(toolCalls).toContain('search_docs')
    expect(toolCalls).toContain('search_web')
  })
})
```

### 5.3 Performance Tests

**Benchmark suite:**
```typescript
describe('Performance', () => {
  it('p50 time to first token < 100ms', async () => {
    const latencies = await measureLatencies(100)
    const p50 = percentile(latencies, 0.5)
    expect(p50).toBeLessThan(100)
  })
  
  it('p95 time to first token < 200ms', async () => {
    const latencies = await measureLatencies(100)
    const p95 = percentile(latencies, 0.95)
    expect(p95).toBeLessThan(200)
  })
  
  it('handles 50 concurrent requests', async () => {
    const requests = Array(50).fill(null).map(() => 
      executeSearchAgent(config)
    )
    const results = await Promise.allSettled(requests)
    const failures = results.filter(r => r.status === 'rejected')
    expect(failures.length).toBe(0)
  })
  
  it('streams at consistent rate', async () => {
    const stream = await executeSearchAgent(config)
    const chunkTimings = await measureChunkTimings(stream)
    const avgDelay = average(chunkTimings)
    expect(avgDelay).toBeLessThan(50) // <50ms between chunks
  })
})
```

### 5.4 Quality Tests

**Test Dataset (200 questions):**
- 50 direct answer questions (math, greetings, general knowledge)
- 50 document search questions (user-specific data)
- 50 web search questions (current events, external info)
- 50 hybrid questions (internal + external data needed)

**Quality metrics:**
```typescript
describe('Quality Assurance', () => {
  it('routes 90% of questions correctly', async () => {
    const results = await testDataset(ROUTING_TEST_CASES)
    const accuracy = results.filter(r => r.correctRoute).length / results.length
    expect(accuracy).toBeGreaterThan(0.9)
  })
  
  it('generates 2-3 relevant queries', async () => {
    const results = await testDataset(SEARCH_TEST_CASES)
    results.forEach(r => {
      expect(r.queries.length).toBeGreaterThanOrEqual(1)
      expect(r.queries.length).toBeLessThanOrEqual(3)
      expect(r.queriesRelevant).toBe(true)
    })
  })
  
  it('no hallucinations on document content', async () => {
    const results = await testDataset(DOCUMENT_TEST_CASES)
    results.forEach(r => {
      expect(r.citedFactsVerified).toBe(true)
      expect(r.hallucinationDetected).toBe(false)
    })
  })
})
```

### 5.5 Regression Tests

**Compare old vs new agent:**
```typescript
describe('Regression Tests', () => {
  it('new agent quality >= old agent quality', async () => {
    const oldResults = await runAgentTests(legacyAgent, TEST_DATASET)
    const newResults = await runAgentTests(searchAgent, TEST_DATASET)
    
    expect(newResults.accuracy).toBeGreaterThanOrEqual(oldResults.accuracy)
    expect(newResults.relevance).toBeGreaterThanOrEqual(oldResults.relevance)
  })
  
  it('new agent is faster than old agent', async () => {
    const oldLatency = await measureLatency(legacyAgent)
    const newLatency = await measureLatency(searchAgent)
    
    expect(newLatency.p95).toBeLessThan(oldLatency.p95 * 0.5) // >50% faster
  })
})
```

### 5.6 CI/CD Integration

**GitHub Actions workflow:**
```yaml
name: Search Agent Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Run unit tests
        run: bun test --coverage
      
      - name: Run integration tests
        run: bun test:integration
      
      - name: Run performance tests
        run: bun test:performance
      
      - name: Check coverage threshold
        run: |
          COVERAGE=$(bun test --coverage --json | jq '.coverage')
          if [ $COVERAGE -lt 80 ]; then
            echo "Coverage $COVERAGE% below 80% threshold"
            exit 1
          fi
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

### 5.7 Manual QA Checklist

**Before each rollout stage:**
- [ ] Test all 4 routing paths (direct, docs, web, hybrid)
- [ ] Verify streaming starts <200ms on real network
- [ ] Test with slow internet connection
- [ ] Verify "Searching..." indicator appears/disappears correctly
- [ ] Check citations are accurate and clickable
- [ ] Test multi-turn conversations (context retained)
- [ ] Verify error messages are user-friendly
- [ ] Test with empty spaces (no documents)
- [ ] Test with disabled web search
- [ ] Verify cost tracking is accurate

---

## Cost Analysis

### Current System
- 3 LLM calls per query
- Avg tokens: 8K input + 2K output per call
- Cost per query: ~$0.015 (gpt-4o)

### New System
- 1 LLM call per query (search agent/answer)
- Avg tokens: 8K input + 2K output
- Cost per query: ~$0.005 (66% reduction)

**Monthly savings (100K queries):**
- Current: $1,500
- New: $500
- **Savings: $1,000/month**

---

## Implementation Checklist

### Phase 1: Streaming Infrastructure
- [ ] Set up `streamText` with tool calling
- [ ] Implement streaming response handler
- [ ] Build context window logic (token-aware)
- [ ] Test basic streaming (no tools)
- [ ] Verify time-to-first-token <200ms

### Phase 2: Search Tools
- [ ] Define search tool schemas (doc + web)
- [ ] Implement executeDocSearches (parallel)
- [ ] Implement executeWebSearches (parallel)
- [ ] Add result formatting
- [ ] Test tool calls in stream

### Phase 3: Integration
- [ ] Write search agent system prompt
- [ ] Connect tools to streaming agent
- [ ] Add client-side stream parsing
- [ ] Implement "Searching..." UI indicator
- [ ] Add citation/source tracking
- [ ] **Write unit tests (target: >80% coverage)**
- [ ] **Write integration tests (E2E flows)**
- [ ] **Write performance tests (latency benchmarks)**
- [ ] End-to-end streaming tests

### Phase 3: Migration
- [ ] Add feature flag
- [ ] Set up A/B testing framework
- [ ] Create monitoring dashboard
- [ ] Deploy to staging
- [ ] Internal testing

### Phase 4: Production
- [ ] Beta rollout (10%)
- [ ] Monitor metrics (latency, errors, cost)
- [ ] **Run regression tests (old vs new agent)**
- [ ] **Verify test coverage >80% in CI**
- [ ] Gradual rollout to 100%
- [ ] Deprecate old agent
- [ ] Update documentation

---

## Open Questions

1. **Tool call timing**: Should LLM call search tools at start, or can it wait mid-generation?
   - **Recommendation**: Prompt encourages early tool calls ("search EARLY"), but allow flexibility

2. **Citation formatting**: How do we inject citations into streamed text?
   - **Option A**: LLM adds `[1]` markers naturally in text
   - **Option B**: Send citations as separate stream metadata
   - **Recommendation**: Option A (simpler, more natural)

3. **Multi-turn optimization**: How do we handle follow-up questions efficiently?
   - **Recommendation**: Include previous search results in conversation history (automatic context)

4. **Stream buffering**: Do we buffer tokens or send immediately?
   - **Recommendation**: Send immediately (minimize perceived latency)

---

## Success Metrics (Week 4)

### Critical (Must-Have)
- ✅ **Time to first token: <200ms (p95)** - STREAMING PRIORITY
- ✅ Streaming works reliably (no interruptions)
- ✅ Error rate: <5%
- ✅ **Test coverage: >80%** (unit + integration + e2e)
- ✅ **All tests passing** (0 failing tests in CI)

### Important (Should-Have)
- ✅ User satisfaction: >85%
- ✅ Cost reduction: >40%
- ✅ Total response time: <3000ms (p95)
- ✅ Tool call accuracy: >90%

### Nice-to-Have
- ✅ Zero data loss during migration
- ✅ Performance regression tests in place
