This is Curiositi's Monorepo. It uses Turborepo and Bun. All packages and apps use Bun.

We use Biome for Lint & Formatting.

We use GitHub for Version Control and GitHub Actions for CI/CD.

This is a pure TypeScript project. We use Bun for running the code.

## Commands

### Development & Build
- `bun run dev` - Runs all apps in dev mode
- `bun run build` - Builds all apps (web transpiles with Next.js, server runs directly with Bun)

### Linting & Formatting
- `bun run lint` - Runs Biome check across all packages
- `bun run lint:fix` - Runs Biome check with --write (auto-fix)
- `bun run format` - Formats code with Biome
- `bun run format:check` - Checks formatting without applying changes

### Type Checking
- `bun run check-types` - Runs TypeScript type checking across all workspaces
- `bun run check` - Runs Biome check + TypeScript type checking

### Single Package Commands
Run commands in specific packages:
- `bun --filter <package-name> <command>` (e.g., `bun --filter web dev`)
- `bun --filter server dev` - Run server dev mode only
- `bun --filter @curiositi/ui check-types` - Type check UI package

## Code Style Guidelines

### Import Style
- Use ES6 imports: `import { X } from "module"`
- Use `import type { X }` for type-only imports
- Package imports: Use workspace protocol (`@curiositi/ui`, `@curiositi/share`)
- Relative imports: Use `./` and `../` for local files
- Export default for main exports, named exports for utilities

### Formatting Rules (Biome)
- Quotes: Double quotes (`"`)
- JSX quotes: Double quotes
- Semicolons: Always required
- Trailing commas: ES5 style
- Arrow parentheses: Always wrap params (`() => {}`, `(x) => {}`)
- No comments in code (unless specifically requested)

### TypeScript Configuration
- Strict mode enabled
- noUncheckedIndexedAccess: true
- Target: ES2022
- Module: NodeNext (base) / ESNext (packages with bundler)
- JSX: react-jsx (React), preserve (Next.js), hono/jsx (Hono)
- Declaration maps enabled
- Use `type` for all type definitions (object shapes, unions, primitives)
- Do not use `interface` - prefer `type` for consistency

### Naming Conventions
- Components: PascalCase (Button, Card, ThemeImage)
- Functions/Methods: camelCase (uploadHandler, handleUpload)
- Variables: camelCase
- Constants: camelCase (logger) or UPPER_CASE for globals
- Types: PascalCase with descriptive names (ButtonProps, ThemeImageProps)
- Files: camelCase (page.tsx, upload.tsx, button.tsx)
- Directories: lowercase (src, handlers, routers)

### React/Next.js Patterns
- Use `"use client"` directive for client components
- Define props types above components
- Use `ReactNode` for children prop type
- Type props destructuring: `({ prop1, prop2 }: Props) => {}`
- Use JSX.Element return type for components (optional but consistent)

### Server (Hono) Patterns
- Separate handlers from routers
- Routers in `routers/`, handlers in `handlers/`
- Use async/await for file operations
- Return JSON responses with appropriate status codes
- Use type assertions carefully: `as File` only when confident
- Log all operations with info/error levels

### Error Handling
- Wrap async operations in try-catch blocks
- Log errors using logger: `logger.error("message", error)`
- Return user-friendly error responses: `{ error: "description" }`
- Never expose internal errors to clients

### File Organization
- Group by feature: `routers/upload.ts`, `handlers/upload.ts`
- Shared utilities: `packages/share/`
- UI components: `packages/ui/src/`
- Apps: `apps/web/`, `apps/server/`
- Type definitions: inline or in `types/` directories

### Workspace References
- `@curiositi/ui` - Shared React components
- `@curiositi/share` - Shared utilities (logger, fs, schemas, constants)
- `@curiositi/tsconfig` - Shared TypeScript configurations

## Important Notes
- Tests have not been set up yet - add test configuration as needed
- Always run `bun run check` before committing
- Server runs with Bun directly (no transpilation), web uses Next.js
- All packages use `"type": "module"` for ESM
- Use workspace protocol for internal dependencies
- Follow existing code patterns when adding new features
