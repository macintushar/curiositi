# Curiositi Agent Architecture

The Curiositi Agent is a sophisticated AI system that combines multiple agent patterns to provide comprehensive, context-aware responses. It demonstrates how different architectural patterns can be combined to create reliable, flexible AI workflows.

## Overview

The Curiositi Agent implements a **hybrid multi-pattern architecture** that dynamically adapts its approach based on available resources and query complexity. It combines sequential processing, parallel execution, intelligent routing, and multi-step tool usage to deliver comprehensive answers.

## Agent Parameters

The agent accepts the following configuration:

```typescript
interface CuriositiAgentConfig {
  input: string; // User's question or request
  modelName: string; // LLM model to use
  history: HistoryMessage[]; // Conversation context
  fileIds: string[]; // Specific files to analyze
  spaceIds: string[]; // Document spaces to search
  enableWebSearch: boolean; // Whether to include web searches
  provider: LLM_PROVIDERS; // LLM provider (OpenAI, Anthropic, etc.)

  // Optional configuration
  maxDocQueries?: number; // Max document queries (default: 3)
  maxWebQueries?: number; // Max web queries (default: 2)
  includeFollowUps?: boolean; // Generate follow-up suggestions
  confidenceThreshold?: number;
  prioritizeRecent?: boolean; // Prioritize recent documents
}
```

## Architecture Patterns

### 1. Sequential Processing (Strategy Planning)

The agent follows a structured 7-step sequential workflow:

1. **Context Analysis**: Analyzes conversation history and available resources
2. **Query Generation**: Creates optimized search queries based on strategy analysis
3. **Information Gathering**: Executes searches across all available sources
4. **Result Processing**: Categorizes and validates gathered information
5. **Context Building**: Synthesizes information from multiple sources
6. **Response Generation**: Creates comprehensive answers with reasoning
7. **Response Parsing**: Extracts structured components from the response

This sequential approach ensures each step builds upon the previous one, creating a coherent information gathering and synthesis pipeline.

### 2. Parallel Processing (Information Gathering)

During Step 3 (Information Gathering), the agent implements **parallel processing** to maximize efficiency:

```typescript
const informationGathering = await Promise.allSettled([
  // Document space searches (parallel across spaces and queries)
  ...spaceIds.flatMap((spaceId) =>
    docQueries.map((query) => docSearchToolWithSpaceId(query, spaceId))
  ),

  // Specific file retrieval (parallel across files)
  ...fileIds.map((fileId) => retrieveFileContent(fileId)),

  // Web searches (parallel across queries)
  ...webQueries.map((query) => webSearchTool.invoke(query)),
]);
```

This parallel execution significantly reduces response time while maintaining comprehensive coverage.

### 3. Intelligent Routing (Strategy Selection)

The agent implements **dynamic routing** based on context analysis:

- **Comprehensive Strategy**: Uses all available sources (documents + web + files)
- **Focused Strategy**: Prioritizes specific high-confidence sources
- **Hybrid Strategy**: Balances breadth and depth based on query complexity
- **Error Strategy**: Graceful fallback when sources are unavailable

The routing decision is made during the initial context analysis and influences query generation and resource allocation.

### 4. Multi-Step Tool Usage

The agent employs specialized tools that can be called iteratively:

- **Document Search Tool**: Semantic search within document spaces
- **Web Search Tool**: Real-time web information retrieval
- **File Content Tool**: Direct file content extraction

Each tool is designed for specific information types, and the agent can make multiple calls to the same tool with different parameters based on the evolving context.

## Information Processing Pipeline

### Context Analysis Phase

The agent begins by analyzing the conversation context to understand:

- **Intent Classification**: What type of answer is needed (factual, analytical, creative)
- **Source Prioritization**: Which available sources would be most valuable
- **Complexity Assessment**: How deep the response needs to be
- **Historical Context**: Key themes from conversation history

### Query Optimization Phase

Based on the context analysis, the agent generates optimized queries:

- **Document Queries**: Semantic search terms for document spaces
- **Web Queries**: Real-time information search terms
- **Query Ranking**: Prioritizes queries by expected information value

### Information Synthesis Phase

The agent synthesizes information using a structured approach:

1. **Source Validation**: Verifies information reliability and relevance
2. **Cross-Referencing**: Identifies patterns and contradictions across sources
3. **Context Integration**: Weaves conversation history into the response
4. **Confidence Assessment**: Evaluates certainty in conclusions

## Response Generation

### Structured Output

The agent provides structured responses with multiple components:

```typescript
interface CuriositiAgentResponse {
  contextSources: {
    documentSpaces: string[]; // Spaces searched
    specificFiles: string[]; // Files analyzed
    webSearches: string[]; // Web queries executed
  };
  reasoning: string; // Explanation of approach
  confidence: number; // Confidence score (0.0-1.0)
  answer: string; // Main response
  followUpSuggestions: string[]; // Related questions
  strategy: string; // Strategy used
}
```

### Quality Control

The agent implements quality control mechanisms:

- **Confidence Scoring**: Numerical assessment of answer reliability
- **Source Attribution**: Clear tracking of information sources
- **Error Handling**: Graceful degradation when sources fail
- **Reasoning Transparency**: Explanation of the decision-making process

## Configuration Options

### Performance Tuning

- **maxDocQueries**: Limits document searches to prevent over-retrieval
- **maxWebQueries**: Controls web search volume for cost management
- **prioritizeRecent**: Weights newer documents higher in results

### Response Customization

- **includeFollowUps**: Generates related questions for continued exploration
- **confidenceThreshold**: Sets minimum confidence for definitive answers

## Error Handling and Resilience

The agent implements robust error handling:

1. **Graceful Degradation**: Continues with available sources when some fail
2. **Source Fallbacks**: Tries alternative approaches when primary sources fail
3. **Error Transparency**: Clearly communicates limitations and uncertainties
4. **Recovery Strategies**: Adapts approach based on partial failures

## Best Practices for Usage

### When to Use Each Pattern

- **Use comprehensive strategy** for complex research questions requiring multiple perspectives
- **Use focused strategy** for specific technical questions with known sources
- **Use hybrid strategy** for questions that benefit from both depth and breadth
- **Monitor confidence scores** to understand answer reliability

### Optimization Tips

1. **Provide relevant file IDs** when you know specific documents contain answers
2. **Use conversation history** to help the agent understand context and intent
3. **Enable web search** for questions requiring current information
4. **Configure query limits** based on response time requirements

## Future Enhancements

The agent architecture is designed for extensibility:

- **Additional Tools**: Can incorporate new information sources
- **Improved Routing**: More sophisticated strategy selection algorithms
- **Enhanced Synthesis**: Better cross-source information integration
- **Real-time Learning**: Adaptation based on usage patterns

This architecture demonstrates how multiple agent patterns can be combined to create sophisticated, reliable AI systems that balance flexibility with control while maintaining transparency and reliability.
