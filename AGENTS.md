This is Curiositi's Monorepo. It uses Turborepo and Bun. All packages and apps use Bun.

We use Biome for Linting & Formatting.

We use GitHub for Version Control and GitHub Actions for CI/CD.

This is a pure TypeScript project. We use Bun for running the code.

Commands:

- `bun run dev` - Runs all apps in Dev mode
- `bun run build` - Builds all apps (just web currently since server runs with Bun without transpilation)
- `bun run lint` - Runs Biome check
- `bun run lint:fix` - Runs Biome check with --write (auto-fix)
- `bun run format` - Formats code with Biome
- `bun run format:check` - Checks formatting without applying changes
- `bun run check-types` - Runs TypeScript type checking
- `bun run check` - Runs Biome check + TypeScript type checking
