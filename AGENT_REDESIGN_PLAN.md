# Agent System Redesign — Implementation Plan

## Overview

Decouple agents from models. Agents = preconfigured tool sets + system prompt + name + maxToolCalls. Models are independently selected at chat time. Two default agents (Ask, Deep Research). Agent switchable mid-conversation via per-message tracking.

## Key Decisions

| Decision | Choice |
|---|---|
| Default agents | Ask (maxToolCalls=10) + Deep Research (maxToolCalls=100) |
| Default agents editable | Yes, fully |
| Default agents deletable | No |
| Agent-model relationship | Fully decoupled — no model on agents at all |
| Agent tracking | Per-message (agentId on messages table) |
| Conversation agentId | Dropped |
| Agent switching mid-convo | Free, history stays intact |
| Agent selector UI | Dropdown with agent cards |
| Model selector UI | Shows all models, warns on missing API keys |
| Default model — OpenAI | gpt-5-mini |
| Default model — Anthropic | Haiku 4.5 (add to bundled.json) |
| Default model — Google | gemini-3-flash-preview |
| Default model — Ollama | First from /api/tags |
| Agent creation | Settings (table + editor), "Create" button in dropdown opens Settings |
| Tool selection | Searchable multi-select in agent editor |
| MCP tools | Org-level config, agents access subset |
| Default agent creation | On org creation, fallback on first /app/chat visit |
| Pre-selected agent | Last used (persisted in store), falls back to Ask |
| Ollama tool filtering | Deferred — user will provide approach later |

---

## Phase 1: Database Schema Changes

**File:** `packages/db/src/schema.ts`

### `agents` table
- **Remove:** `modelProvider`, `modelId`, `temperature`, `maxTokens`, `contextWindow`, `searchProvider`
- **Keep:** `id`, `name`, `description`, `organizationId`, `createdById`, `systemPrompt`, `isActive`, `createdAt`, `updatedAt`
- **Add:** `maxToolCalls` (integer, default 10), `isDefault` (boolean, default false)

### `conversations` table
- **Remove:** `agentId` column, FK, and index
- Keep everything else

### `messages` table
- **Add:** `agentId` (uuid, nullable, FK to `agents.id`)
- **Add:** index on `agentId`

### Relations
- Remove `conversations.agent` relation
- Remove `agents.conversations` relation
- Add `messages.agent` relation

---

## Phase 2: DB Query Updates

**File:** `packages/db/src/queries/agents.ts`

### Replace setup functions
- `ensureDefaultAgents(orgId, userId)` — checks if any agents exist, if not calls `setupOrganization()`
- `setupOrganization(orgId, userId)` — creates default tools + Ask agent + Deep Research agent + links all tools to both

### Update CRUD functions
- `createCustomAgent()` — remove model fields, add `maxToolCalls`
- `updateAgent()` — same field removals, add `maxToolCalls`
- `deleteAgent()` — check `isDefault` instead of non-existent `type` field

### New functions
- `getFirstAvailableAgent(orgId)` — returns any active agent for fallback

**File:** `packages/db/src/queries/conversations.ts`
- `createConversation()` — remove `agentId` param

**File:** `packages/db/src/queries/messages.ts`
- `createMessage()` — add optional `agentId` param

---

## Phase 3: Agent Package Updates

**File:** `packages/agent/src/types.ts`
- Strip `modelProvider`, `modelName`, `modelId`, `temperature`, `maxTokens`, `contextWindow`, `searchProvider` from `AgentConfig` and `CreateAgentParams`
- Add `maxToolCalls`

**File:** `packages/agent/src/create.ts`
- Accept `model` as a separate parameter (not from agent config)
- Accept `maxToolCalls` from agent config for `stopWhen`

**File:** `packages/agent/src/constants.ts`
- Update defaults, add `DEFAULT_MAX_TOOL_CALLS`

---

## Phase 4: API Route Updates

**File:** `apps/platform/src/routes/api/chat/$conversationId.ts`

- `agentId` always **required** from request body
- No model fallback to agent — model is always from request
- Resolve agent from `body.agentId`, validate org ownership
- Use `agent.maxToolCalls` for `stopWhen` in `streamText()`
- Use `agent.systemPrompt` as system prompt
- Build tools from `agent.agentTools` (filtered by request toggles)
- Save `agentId` on assistant messages in `onFinish`

---

## Phase 5: tRPC Router Updates

### Pre-step: Audit existing dependencies
- Search codebase for all callers of `getAgentForConversation` before removing it
- Search for any direct references to `conversations.agentId` in queries, components, or stores

**File:** `apps/platform/src/integrations/trpc/routers/agent.ts`

- Update `create` input — remove model fields, add `systemPrompt`, `maxToolCalls`
- Update `update` input — same changes
- Update `delete` — check `isDefault` instead of `type`
- Add `bulkLinkTools` mutation — link multiple tools to an agent at once
- Add `createAgentWithTools()` — wraps `createAgent()` + `bulkLinkTools()` in a single `db.transaction()` to prevent orphaned agents with zero tools
- Add `updateAgentWithTools()` — wraps `updateAgent()` + tool link replacement (delete old + insert new) in a single `db.transaction()` to prevent stale tool state
- Remove `getModels`, `getModelDetails` (or move to separate router)

**File:** `apps/platform/src/integrations/trpc/routers/chat.ts`

- `createConversation` — remove `agentId` from input and creation
- `addMessage` — add `agentId` to input
- Remove `getAgentForConversation` (after audit confirms no callers)
- Add `getMessagesWithAgents` — returns messages with agent info joined

---

## Phase 6: Chat Store Updates

**File:** `apps/platform/src/stores/chat-store.ts`

- Keep `selectedAgentId`, `selectedModelId`, `selectedModelProvider`
- Add `availableAgents: Agent[]` cache
- Keep tool toggles as-is

---

## Phase 7: New UI Components

### Agent Selector
**New file:** `apps/platform/src/components/chat/agent-selector.tsx`

- Popover with agent cards: name, description, tool count
- "Create new agent" button → opens Settings dialog to Agent tab
- Selected agent highlighted
- Searchable

### Updated Chat Input
**File:** `apps/platform/src/components/chat/chat-input.tsx`

- Add `<AgentSelector />` alongside `<ModelSelector />`

---

## Phase 8: Chat Hook & Page Updates

**File:** `apps/platform/src/hooks/use-chat.ts`
- Always include `agentId` from store in transport body

**File:** `apps/platform/src/pages/new-chat.tsx`
- Remove `agentId` from `createConversation` call
- Load agents on mount, default select Ask

**File:** `apps/platform/src/pages/chat-conversation.tsx`
- Load agents on mount

---

## Phase 9: Settings Agent Page Rewrite

**File:** `apps/platform/src/components/settings/agent-settings.tsx`

### Layout
- Table: Name | Description | Tools | Max Tool Calls | Actions (Edit, Delete)
- "Create Agent" button
- Default agents show badge, delete disabled

### Agent Editor (modal)
- Name (required)
- Description (optional)
- System Prompt (required)
- Max Tool Calls (default 10)
- Tools (searchable multi-select of all org tools)
- Save / Cancel

### Wiring
- Load agents via `trpc.agent.getAll`
- Load tools via `trpc.agent.getAvailableTools`
- Create via `trpc.agent.create` + `trpc.agent.bulkLinkTools`
- Update via `trpc.agent.update` + `trpc.agent.bulkLinkTools`
- Delete via `trpc.agent.delete` (disabled for `isDefault`)

---

## Phase 10: Model Selector Updates

**File:** `apps/platform/src/components/chat/model-selector.tsx`

- Show ALL models
- Add visual warning (dimmed/disabled state) for models whose provider has no API key configured

**File:** `apps/platform/src/integrations/trpc/routers/agent.ts` (or wherever models are fetched)

- The response that returns the list of models includes an `enabled` flag per provider (e.g. `{ provider: "openai", enabled: true }`)
- This flag is computed by checking if the provider's API key is configured
- The model selector uses this flag for visual styling only — selection still allowed but visually discouraged

---

## Phase 11: Default Models & Bundled Data

**File:** `packages/share/src/models/bundled.json`
- Add Claude Haiku 4.5 to Anthropic models

**File:** `packages/share/src/models/index.ts`
- Update `DEFAULT_MODELS`:
  - openai: `openai/gpt-5-mini`
  - anthropic: `anthropic/claude-haiku-4-5` (or whatever the added model ID is)
  - google: `google/gemini-3-flash-preview`
  - ollama: dynamic (first from /api/tags)
- Update `PROVIDER_DEFAULTS` accordingly

**File:** `packages/agent/src/` (new or existing)
- Add Ollama model fetching from `/api/tags` with caching
- Filter for tool support (deferred — user will provide approach)

---

## Phase 12: Seed / Migration

- Create Ask agent (maxToolCalls=10, isDefault=true)
- Create Deep Research agent (maxToolCalls=100, isDefault=true)
- Create default tools (fileSearch, webSearch) if not exist
- Link all tools to both default agents

---

## File Change Summary

| File | Change |
|---|---|
| `packages/db/src/schema.ts` | Schema changes |
| `packages/db/src/queries/agents.ts` | Query rewrites |
| `packages/db/src/queries/conversations.ts` | Remove agentId |
| `packages/db/src/queries/messages.ts` | Add agentId |
| `packages/agent/src/types.ts` | Type updates |
| `packages/agent/src/create.ts` | Decouple model from agent |
| `packages/agent/src/constants.ts` | Update defaults |
| `apps/platform/src/routes/api/chat/$conversationId.ts` | API route rewrite |
| `apps/platform/src/integrations/trpc/routers/agent.ts` | Router updates |
| `apps/platform/src/integrations/trpc/routers/chat.ts` | Router updates |
| `apps/platform/src/stores/chat-store.ts` | Store updates |
| `apps/platform/src/components/chat/agent-selector.tsx` | **NEW** |
| `apps/platform/src/components/chat/chat-input.tsx` | Add agent selector |
| `apps/platform/src/components/chat/model-selector.tsx` | Add API key warnings |
| `apps/platform/src/hooks/use-chat.ts` | Send agentId |
| `apps/platform/src/pages/new-chat.tsx` | Remove agentId from create |
| `apps/platform/src/pages/chat-conversation.tsx` | Load agents on mount |
| `apps/platform/src/components/settings/agent-settings.tsx` | Complete rewrite |
| `packages/share/src/models/bundled.json` | Add Haiku 4.5 |
| `packages/share/src/models/index.ts` | Update default models |
