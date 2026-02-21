---
description: Update documentation based on branch changes vs main
agent: docs-writer
---

Analyze the current git branch changes and update relevant documentation.

## Current Branch

Branch: `!git branch --show-current`

## Changes vs Main

```
!git diff main...HEAD --stat
```

## Task

Based on the changes detected:

1. Identify which source files were modified
2. Find corresponding documentation files in apps/www/src/content/docs/docs/
3. Update the documentation to reflect the changes
4. Do NOT commit changes - just show what updates would be made

Focus on accuracy - only update docs that directly relate to the code changes.
