# Docker Setup Guide for Curiositi

This guide explains how to run Curiositi using Docker for both development and production environments, including deployment on platforms like Render.

## Prerequisites

- Docker (version 20.10 or later)
- Docker Compose (version 2.0 or later)
- At least 4GB of available RAM

## Quick Start

### Local Development

1. **Clone the repository and navigate to the project root**

2. **Start the application:**

   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Web UI: http://localhost:3040
   - API Server: http://localhost:3030
   - SearXNG: http://localhost:8095
   - PostgreSQL: localhost:5432

### Cloud Deployment (Render, Railway, etc.)

For cloud platforms, you don't need a `.env` file. Set environment variables directly in your platform's dashboard:

**Required Environment Variables:**

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key for authentication
- `NODE_ENV`: Set to `production`
- `SERVER_URL`: Your API domain (e.g., `https://your-api.onrender.com`)
- `BASE_URL`: Your app domain (e.g., `https://your-app.onrender.com`)
- `NEXT_PUBLIC_BASE_URL`: Same as BASE_URL
- `NEXT_PUBLIC_SERVER_URL`: Same as SERVER_URL

**Optional Environment Variables:**

- `SEARXNG_URL`: External SearXNG instance (if not self-hosting)
- `OLLAMA_BASE_URL`: External Ollama instance
- `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`: For LLM providers
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`: For error tracking

## Services Overview

### Core Services

- **web-ui**: Next.js frontend application (port 3040)
- **server**: Hono backend API (port 3030)

### Supporting Services

- **postgres**: PostgreSQL database with pgvector for embeddings (port 5432)
- **searxng**: Search engine aggregator (port 8095)

### External Dependencies (Optional)

- **Ollama**: Local LLM server (runs on host at port 11434)

## Development Mode

The default configuration is optimized for development:

- Hot reload enabled for both frontend and backend
- Source code volumes mounted for live editing
- Environment validation skipped for faster builds
- Debug logging enabled

### File Watching

The following directories are mounted as volumes for development:

- `./clients/web/src` → `/app/src` (Web UI source)
- `./clients/web/public` → `/app/public` (Static assets)
- `./server/src` → `/app/src` (Server source)
- `./server/drizzle` → `/app/drizzle` (Database migrations)

## Production Deployment

### Platform-Specific Setup

**Render.com:**

1. Connect your repository
2. Set environment variables in Render dashboard
3. Deploy using the included Dockerfiles
4. Enable auto-deploy from your main branch

**Railway.app:**

1. Connect your repository
2. Set environment variables in Railway dashboard
3. Use Docker-based deployment
4. Configure custom domains as needed

**Fly.io:**

1. Install Fly CLI
2. Run `fly launch` in project root
3. Configure environment variables with `fly secrets set`
4. Deploy with `fly deploy`

### Environment Variables Configuration

The application reads environment variables directly from the system, so no `.env` file is needed in production. All major cloud platforms provide interfaces to set these variables.

**Example configuration for Render:**

```bash
# Database (use Render's PostgreSQL add-on)
DATABASE_URL=postgres://user:pass@hostname:5432/dbname

# Authentication (generate a secure random string)
BETTER_AUTH_SECRET=your-super-secret-key-32-chars-min

# URLs (update with your actual domains)
NODE_ENV=production
SERVER_URL=https://your-api.onrender.com
BASE_URL=https://your-app.onrender.com
NEXT_PUBLIC_BASE_URL=https://your-app.onrender.com
NEXT_PUBLIC_SERVER_URL=https://your-api.onrender.com

# Optional: External services
SEARXNG_URL=https://searx.example.com
OLLAMA_BASE_URL=https://ollama.example.com
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**

   ```bash
   # Check if ports are already in use
   netstat -tlnp | grep :3030
   netstat -tlnp | grep :3040
   ```

2. **Database connection issues:**

   ```bash
   # Check database logs
   docker-compose logs postgres

   # Restart database service
   docker-compose restart postgres
   ```

3. **Web UI build failures:**

   ```bash
   # Clear build cache and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

4. **Environment variable issues:**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure BETTER_AUTH_SECRET is at least 32 characters

### Health Checks

All services include health checks:

- Server: `curl -f http://localhost:3030/`
- Database: `pg_isready -U user -d mydb`
- Web UI: `curl -f http://localhost:3040/`

Check service health:

```bash
docker-compose ps
```

### Logs

View logs for specific services:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs server
docker-compose logs web-ui
docker-compose logs postgres

# Follow logs
docker-compose logs -f server
```

### Data Persistence

The following data is persisted in Docker volumes:

- `postgres_data`: Database data including vector embeddings
- `searxng_data`: Search engine configuration

To backup data:

```bash
# Backup database
docker-compose exec postgres pg_dump -U user mydb > backup.sql

# Backup volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data
```

## Performance Optimization

### For Development

- Allocate at least 4GB RAM to Docker
- Enable file sharing for project directory
- Use SSD storage for better I/O performance

### For Production

- Use multi-stage builds (already implemented)
- Enable Docker BuildKit for faster builds
- Consider using Docker Swarm or Kubernetes for scaling
- Implement proper logging and monitoring
- Use external managed databases for better performance

## Vector Storage

This application uses **PostgreSQL with pgvector** for vector embeddings, not ChromaDB. This provides:

- Better performance for mixed workloads
- Simplified deployment (one less service)
- ACID compliance for data consistency
- Cost-effective scaling

## Security Considerations

1. **Change default passwords** in production
2. **Use secrets management** for sensitive data
3. **Configure firewalls** to restrict access
4. **Enable SSL/TLS** with reverse proxy
5. **Regular security updates** for base images
6. **Scan images** for vulnerabilities
7. **Use strong BETTER_AUTH_SECRET** (minimum 32 characters)

## Support

For issues related to Docker setup:

1. Check the troubleshooting section above
2. Review Docker and Docker Compose logs
3. Verify your environment configuration
4. Check system requirements and resource allocation
5. For cloud deployment issues, check your platform's documentation
