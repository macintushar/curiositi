---
title: Self-Hosting Guide
description: This guide covers self-hosting Curiositi and its dependencies, including web search options.
---

This guide covers self-hosting Curiositi and its dependencies, including web search options.

## Overview

Curiositi can be fully self-hosted, giving you complete control over your data and infrastructure. This guide covers:

- **Core Application**: Curiositi server and web UI
- **Database**: PostgreSQL with pgvector
- **Web Search**: Choose between Firecrawl Cloud API or self-hosted Firecrawl
- **Optional Services**: Email, monitoring, and other integrations

## Quick Start

### Option 1: Docker Compose (Recommended)

The fastest way to get started with self-hosting:

```bash
git clone <your-fork-or-origin> curiositi
cd curiositi
cp apps/server/.env.example apps/server/.env
# Edit .env with your configuration
docker-compose up
```

This starts:

- Curiositi server (port 3030)
- Curiositi web UI (port 3040)
- PostgreSQL with pgvector (port 5432)

### Option 2: Manual Setup

For more control or custom deployments, see the [Getting Started](getting-started.md) guide.

## Web Search Configuration

Curiositi supports web search through Firecrawl. You have two options:

### Option A: Firecrawl Cloud API (Recommended)

**Pros:**

- No infrastructure to manage
- Always up-to-date with latest features
- Built-in rate limiting and reliability
- Easy to get started

**Setup:**

1. Sign up at [firecrawl.dev](https://firecrawl.dev)
2. Generate an API key from your dashboard
3. Add to your environment:

```bash
FIRECRAWL_API_KEY=fc-your-api-key-here
```

**Pricing:** Pay-per-use with generous free tier. See [Firecrawl pricing](https://firecrawl.dev/pricing).

### Option B: Self-Hosted Firecrawl

**Pros:**

- Complete data privacy
- No external API dependencies
- Full control over configuration
- No usage limits

**Cons:**

- Requires additional infrastructure
- More complex setup and maintenance
- Need to handle updates and scaling

**Setup:**

1. **Deploy Firecrawl:**

   ```bash
   # Clone Firecrawl repository
   git clone https://github.com/mendableai/firecrawl.git
   cd firecrawl

   # Follow Firecrawl's self-hosting guide
   # See: https://docs.firecrawl.dev/contributing/running-locally
   ```

2. **Configure Curiositi:**

   ```bash
   # Point to your self-hosted Firecrawl instance
   FIRECRAWL_API_KEY=your-self-hosted-api-key
   FIRECRAWL_BASE_URL=http://your-firecrawl-instance:3000
   ```

3. **Update webSearch.ts** (if using custom base URL):
   ```typescript
   const firecrawl = new Firecrawl({
     apiKey: FIRECRAWL_API_KEY,
     baseURL: process.env.FIRECRAWL_BASE_URL, // Add this line
   });
   ```

**Resources:**

- [Firecrawl Self-Hosting Documentation](https://docs.firecrawl.dev/contributing/running-locally)
- [Firecrawl GitHub Repository](https://github.com/mendableai/firecrawl)
- [Firecrawl Docker Setup](https://docs.firecrawl.dev/contributing/running-locally#docker)

## Complete Self-Hosting Stack

### Core Services

| Service          | Purpose                | Port | Self-Hosted |
| ---------------- | ---------------------- | ---- | ----------- |
| Curiositi Server | API and ingestion      | 3030 | ✅          |
| Curiositi Web UI | Frontend interface     | 3040 | ✅          |
| PostgreSQL       | Database with pgvector | 5432 | ✅          |
| Firecrawl        | Web search (optional)  | 3000 | ✅          |

### Optional Services

| Service       | Purpose           | Self-Hosted Options                                                                                       |
| ------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| Email         | User verification | [Mailcow](https://mailcow.github.io/mailcow-dockerized-docs/), [Mail-in-a-Box](https://mailinabox.email/) |
| Monitoring    | Logs and metrics  | [Grafana](https://grafana.com/), [Prometheus](https://prometheus.io/)                                     |
| Reverse Proxy | SSL and routing   | [Nginx](https://nginx.org/), [Traefik](https://traefik.io/)                                               |
| File Storage  | Document storage  | [MinIO](https://min.io/), [SeaweedFS](https://github.com/seaweedfs/seaweedfs)                             |

## Production Deployment

### Security Considerations

1. **Environment Variables:**

   ```bash
   # Use strong secrets
   BETTER_AUTH_SECRET=$(openssl rand -base64 32)

   # Restrict database access
   DATABASE_URL=postgres://curiositi:strong-password@localhost:5432/curiositi

   # Enable HTTPS in production
   NODE_ENV=production
   ```

2. **Network Security:**

   - Use a reverse proxy (Nginx/Traefik) for SSL termination
   - Restrict database access to application servers only
   - Use firewall rules to limit exposed ports

3. **Data Protection:**
   - Regular database backups
   - Encrypted storage for sensitive files
   - Secure key management

### Scaling Considerations

1. **Horizontal Scaling:**

   - Curiositi server is stateless and can be scaled horizontally
   - Use load balancer to distribute requests
   - Consider Redis for session storage in multi-instance setups

2. **Database Scaling:**

   - Use connection pooling (pgBouncer)
   - Consider read replicas for heavy read workloads
   - Monitor pgvector performance with large datasets

3. **Storage Scaling:**
   - Use external object storage (S3-compatible) for file uploads
   - Implement CDN for static assets
   - Consider distributed file systems for large deployments

## Monitoring and Maintenance

### Health Checks

Monitor these endpoints:

- `GET /health` - Application health
- `GET /api/v1/configs` - Service configuration
- Database connectivity
- Firecrawl API availability (if using cloud)

### Logging

Configure structured logging:

```bash
# Enable Sentry for error tracking
SENTRY_DSN=your-sentry-dsn

# Configure log levels
LOG_LEVEL=info
```

### Backup Strategy

1. **Database Backups:**

   ```bash
   # Daily automated backups
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **File Backups:**

   - Regular snapshots of uploaded files
   - Test restore procedures

3. **Configuration Backups:**
   - Version control for environment configurations
   - Document deployment procedures

## Troubleshooting

### Common Issues

1. **Database Connection Issues:**

   - Check PostgreSQL is running and accessible
   - Verify connection string format
   - Ensure pgvector extension is installed

2. **Firecrawl Integration Issues:**

   - Verify API key is correct and has credits
   - Check network connectivity to Firecrawl
   - Review rate limiting and quota usage

3. **File Upload Issues:**
   - Check disk space and permissions
   - Verify file type restrictions
   - Monitor memory usage during processing

### Getting Help

- Check the [Troubleshooting Guide](troubleshooting.md)
- Review application logs for error details
- Join the community for support

## Migration from Cloud to Self-Hosted

If you're migrating from Curiositi Cloud:

1. **Export Data:**

   - Download your documents and conversations
   - Export user configurations

2. **Setup Infrastructure:**

   - Follow this self-hosting guide
   - Configure your preferred services

3. **Import Data:**

   - Upload documents to your self-hosted instance
   - Recreate user accounts and spaces

4. **Update DNS:**
   - Point your domain to your self-hosted instance
   - Update any integrations or bookmarks

## Cost Considerations

### Self-Hosting Costs

- **Infrastructure:** VPS/cloud instance costs
- **Database:** PostgreSQL hosting
- **Storage:** File storage and backups
- **Bandwidth:** Data transfer costs
- **Maintenance:** Time and expertise required

### Firecrawl Costs

- **Cloud API:** Pay-per-use pricing
- **Self-Hosted:** Infrastructure costs only

Compare costs based on your usage patterns and requirements.

## Next Steps

1. Choose your deployment method (Docker Compose or manual)
2. Configure web search (Firecrawl Cloud or self-hosted)
3. Set up monitoring and backups
4. Plan for scaling as you grow

For specific deployment scenarios, see the [Deployment Guide](deployment.md).
