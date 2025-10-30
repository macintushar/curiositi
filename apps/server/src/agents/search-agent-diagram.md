# Search Agent Flow Diagram

This diagram describes how the search-agent.ts works.

```mermaid
graph TD
    Start([executeSearchAgent called]) --> Init[Initialize Configuration<br/>- modelName, provider<br/>- spaces, enableWebSearch<br/>- maxDocQueries, maxWebQueries<br/>- user, threadId, history]
    
    Init --> Log1[Log execution start<br/>with context info]
    
    Log1 --> CreateAgent[createSearchAgent<br/>- Initialize Agent with LLM<br/>- Add system prompt<br/>- Configure tools<br/>- Set temperature: 0.6<br/>- Stop at 10 steps]
    
    CreateAgent --> BuildPrompt[buildUserPrompt<br/>- User info & timezone<br/>- Available spaces<br/>- Space file counts<br/>- User question]
    
    BuildPrompt --> PrepMessages[Prepare Messages<br/>- Map history to messages<br/>- Append current user prompt]
    
    PrepMessages --> Stream[agent.stream]
    
    Stream --> AsyncFlow{Async Processing}
    Stream --> ReturnResult[Return stream result<br/>to caller immediately]
    
    AsyncFlow --> Await[await Promise.all<br/>- text<br/>- totalUsage<br/>- toolResults<br/>- toolCalls<br/>- reasoningText<br/>- finishReason]
    
    Await --> LogFinish[Log stream finish reason]
    
    LogFinish --> ParseSources[Parse Tool Results<br/>into structured sources]
    
    ParseSources --> Iterate{For each<br/>toolResult}
    
    Iterate --> CheckOutput{Has output<br/>field?}
    CheckOutput -->|Yes| ExtractOutput[Extract output]
    CheckOutput -->|No| UseDirectly[Use result directly]
    
    ExtractOutput --> IsString{Is string?}
    UseDirectly --> IsString
    
    IsString -->|Yes| ParseJSON[Try parse JSON]
    IsString -->|No| NextResult
    
    ParseJSON --> HasResults{Has results<br/>array?}
    HasResults -->|Yes| ExtractFields[Extract title, content,<br/>source, query]
    HasResults -->|No| NextResult[Next result]
    
    ExtractFields --> AddSource[Add to parsedSources]
    AddSource --> NextResult
    
    NextResult --> Iterate
    
    Iterate -->|Done| SaveDB[Insert to database<br/>messagesTable]
    
    SaveDB --> SaveUser[Save user message<br/>- input, provider<br/>- model, threadId]
    
    SaveUser --> SaveAssistant[Save assistant message<br/>- text, usage<br/>- reasoning, toolCalls<br/>- toolResults, sources<br/>- finishReason]
    
    SaveAssistant --> End([Complete])
    
    ParseSources -.->|Error| Ignore1[Ignore parse errors]
    Iterate -.->|Error| Ignore2[Swallow parsing issues]
    AsyncFlow -.->|Error| LogError[Log stream error]
    
    ReturnResult --> UserReceives[User receives<br/>streaming response]
    
    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style CreateAgent fill:#e1e5ff
    style Stream fill:#fff4e1
    style SaveDB fill:#f0e1ff
    style ReturnResult fill:#e1fff4
```

## Key Components

### 1. Initialization (lines 124-148)
Configuration setup including model, provider, spaces, and search settings with detailed logging.

### 2. Agent Creation (lines 106-121)
Creates an AI agent with:
- LLM model and provider
- System prompt defining search behavior
- Tool configuration (document search, web search)
- Temperature: 0.6
- Max steps: 10

### 3. Prompt Building (lines 81-104)
Constructs user prompt with:
- User information and timezone
- Available document spaces
- Space metadata (file counts, descriptions)
- User's question

### 4. Message Preparation (lines 167-173)
Formats conversation history and appends current user prompt.

### 5. Streaming (lines 179, 269)
Returns immediate stream to caller for real-time response delivery.

### 6. Async Processing (lines 181-267)
Background processing that:
- Awaits all stream results in parallel (text, usage, tool results, etc.)
- Parses tool results into structured sources
- Handles JSON parsing with error resilience
- Saves both user and assistant messages to database

## Notable Features

- **System Prompt**: Defines when to use search tools, citation format, and search strategy (lines 34-79)
- **Dual Search**: Supports both document search and web search tools
- **Streaming Response**: Results are streamed to users immediately while processing continues
- **Error Handling**: Robust error handling that swallows parsing errors to prevent failures
- **Source Tracking**: Extracts and stores citations from tool results for reference tracking
- **Database Persistence**: Saves complete conversation history with metadata
