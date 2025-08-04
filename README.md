<p align="center">
   <img src="./apps/web/src/assets/logo.svg" alt="Curiositi Logo" width="200" style="fill: #10b981" />
</p>

# Curiositi

A modern AI-powered knowledge management platform built with Next.js, Bun, and Turborepo.

## 🏗️ Architecture

This repository uses **Turborepo** for efficient monorepo management with the following structure:

```
curiositi/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── server/       # Bun-based backend server
├── packages/         # Shared libraries (future use)
├── turbo.json        # Turborepo configuration
└── package.json      # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Turborepo](https://turbo.build/) (installed automatically)

### Development

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Start development servers:**

   ```bash
   bun run dev
   ```

   This starts both the web app (port 3040) and server concurrently.

3. **Run specific tasks:**

   ```bash
   # Build all applications
   bun run build

   # Type checking
   bun run typecheck

   # Linting
   bun run lint

   # Formatting
   bun run format

   # Database operations
   bun run db:generate
   bun run db:migrate
   bun run db:studio
   ```

## 📦 Available Scripts

### Root Level (Turborepo)

- `bun run build` - Build all applications
- `bun run dev` - Start development servers
- `bun run lint` - Lint all packages
- `bun run typecheck` - Type check all packages
- `bun run format` - Format all code
- `bun run db:*` - Database operations

### Web App (`apps/web`)

- `bun run dev` - Start Next.js development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run typecheck` - Run TypeScript compiler

### Server (`apps/server`)

- `bun run dev` - Start Bun development server with hot reload
- `bun run start` - Start production server
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

## 🔧 Turborepo Features

### Caching

Turborepo automatically caches build outputs, making subsequent builds much faster. The cache is stored in `.turbo/`.

### Parallel Execution

Tasks run in parallel across all packages, significantly reducing build times.

### Dependency Graph

Turborepo understands the dependency graph between packages and runs tasks in the correct order.

## 🏛️ Project Structure

```
curiositi/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── server/              # Bun backend
│       ├── src/
│       ├── drizzle/
│       └── package.json
├── packages/                # Shared libraries (future)
├── docs/                   # Documentation
├── docker-compose.yml      # Docker services
├── turbo.json             # Turborepo configuration
└── package.json           # Root workspace
```

## 🐳 Docker

The project includes Docker Compose for local development:

```bash
docker-compose up -d
```

This starts PostgreSQL and other required services.

## 📚 Documentation

- [Getting Started Guide](docs/getting-started.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Roadmap](docs/ROADMAP.md)

## 🤝 Contributing

Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
