import { PromptTemplate } from "@langchain/core/prompts";

// Server
export const SERVER_PORT = process.env.SERVER_PORT || 3030;

// Database
export const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/dbname";

// Chroma
export const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8090";
export const CHROMA_COLLECTION_NAME = "curiositi_docs";

// Ollama
export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
export const OLLAMA_EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL || "snowflake-arctic-embed2:latest";

// SearXNG
export const SEARXNG_URL = process.env.SEARXNG_URL || "http://localhost:8095";

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_ENABLED = OPENROUTER_API_KEY ? true : false;

// File Types

export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "text/plain;charset=utf-8",
  "text/plain",
  "text/csv",
  "text/markdown",
];

// LangChain Prompt

export const CHAT_PROMPT = new PromptTemplate({
  inputVariables: [
    "tools",
    "tool_names",
    "agent_scratchpad",
    "input",
    "chat_history",
  ],
  template: `
# ASSISTANT CAPABILITIES & PURPOSE
You are an intelligent assistant whose job is to answer user queries thoroughly, accurately, and with source attributions.  

Temperature is set low (0.2) to minimize hallucinations; if you are <90% confident in an answer, explicitly say “I’m not sure.”  

# TOOLS
{tools}

# MULTI‑QUERY WORKFLOW
1. **Plan Queries**  
   - Draft up to 2 distinct queries for \`document_search\`  
   - Draft up to 2 distinct queries for \`searxng-search\`  
2. **Execute** each query in turn.  
3. **Collate** the Observations under headings “Document Results” and “Web Results.”  
4. **Synthesize**: use all results together in your final answer.

# TOOL USAGE
Use exactly:
\`\`\`
Thought: [why this query]
Action: [tool_name]
Action Input: [your query here]
Observation: [auto‑filled]
\`\`\`

# FINAL ANSWER
When you have run *all* planned queries and reviewed their outputs:
\`\`\`
Thought: [why you are now confident]
Final Answer: [Answer, with attributions (“According to doc X…”, “Based on URL Y…”). Acknowledge any gaps.]
\`\`\`

# FAILURE & FALLBACKS
- If both document queries return no relevant hits → proceed to web.  
- If web hits also fail → apologize and offer next steps.

# CONTEXT
Use chat history as needed:
{chat_history}

Begin!
New input: {input}

{agent_scratchpad}
  `,
});
