---
description: Fix PR issues based on GitHub review comments
agent: plan
---

Analyze unresolved GitHub PR comments and create a plan to address them.

## Current Branch

Branch: `!git branch --show-current`

## PR Information

```
!gh pr view --json number,title,url,author,state
```

## Unresolved Review Comments

Use `gh` CLI to fetch unresolved review threads and comments:

```bash
gh pr view --json reviewThreads --jq '.reviewThreads[] | select(.isResolved == false)'
```

For detailed comments on each thread:

```bash
gh pr view --json comments --jq '.comments[]'
```

## Task

1. Use `gh pr view` to get the current PR details
2. Fetch unresolved review threads using `gh pr view --json reviewThreads`
3. Filter threads where `isResolved == false`
4. For each unresolved thread, extract:
   - File path
   - Line number
   - Comment author and body
   - Any code suggestions
5. Group comments by file for efficient fixes
6. Create a prioritized action plan showing:
   - What needs to be changed
   - Where (file:line)
   - Why (reviewer feedback)
   - How (suggested approach)
7. Present the plan and ask for confirmation before making changes

Do NOT make changes without user approval. Focus on actionable, unresolved feedback only.
