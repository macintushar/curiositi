# Contributing to Curiositi

We're thrilled that you're interested in contributing to Curiositi! This guide will help you set up your development environment and understand our workflow.

## 🛠️ Prerequisites

- **Bun**: We use [Bun](https://bun.sh) as our package manager and runtime.
- **Docker**: (Optional) For running services like PostgreSQL if you don't have them installed locally.

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/macintushar/curiositi.git
    cd curiositi
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    Copy the `.env.example` file (if available) or ask a maintainer for the necessary environment variables.
    ```bash
    cp .env.example .env
    ```

4.  **Start the development server:**
    This will start all applications (platform, worker, etc.) in development mode using Turborepo.
    ```bash
    bun run dev
    ```

## 📦 Project Structure

We use a monorepo structure powered by Turborepo and Bun Workspaces.

- **`apps/`**: Contains the main applications.
    - `platform`: The main web platform (React/TanStack Start).
    - `worker`: Background worker service.
- **`packages/`**: Shared libraries and utilities.
    - `db`: Database schema and Drizzle ORM setup.
    - `share`: Shared utilities, types, and constants.
    - `api-handlers`: Shared API logic.

## 🧪 Code Quality

Before submitting a Pull Request, please ensure your code passes our quality checks.

- **Linting & Formatting**: We use [Biome](https://biomejs.dev/).
    ```bash
    # Run this from the root directory
    bun run check      # Runs Biome check + Type check
    bun run lint:fix   # Fixes linting issues automatically
    bun run format     # Formats code
    ```

## 📝 Commit Messages & Releases

We use a strictly automated release process based on **Conventional Commits**. This means your commit messages directly determine the version bumps and changelogs.

### Commit Format
We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:** `<type>(<scope>): <description>`

**Types:**
- `feat`: A new feature (Minor release)
- `fix`: A bug fix (Patch release)
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

**Scopes:**
- `platform`, `worker`, `db`, `share`, `queue`, `api`

**Examples:**
- `feat(platform): added new dashboard widget` (Bumps platform minor version)
- `fix(worker): resolved memory leak in PDF parser` (Bumps worker patch version)
- `chore: updated dependencies` (No release)

### Breaking Changes
To trigger a **Major** release, add `!` after the type/scope or include `BREAKING CHANGE:` in the footer.
- `feat(db)!: dropped user table`
- `fix!: changed api response format`

### 🚫 No Manual Changesets Required
You do **not** need to run `bun changeset` manually. Our CI/CD pipeline automatically analyzes your commit messages every Friday at 00:00 UTC to generate the necessary changesets and releases. Just commit properly, and the rest is magic! ✨

## 🤝 Pull Request Process

1.  Create a new branch for your feature or fix.
2.  Make your changes.
3.  Ensure `bun run check` passes.
4.  Submit a Pull Request.
5.  Ensure your PR title and commits follow the Conventional Commits format.
