---
title: Deployment Guide
description: Complete guide for building, deploying, and scaling Curiositi in production environments.
---

This guide covers deploying Curiositi to production, from simple single-server setups to complex multi-region deployments.

## Quick Deployment Options

### Option 1: Vercel + Railway (Recommended for Small Teams)

**Best for:** Quick setup, low maintenance, automatic scaling

**Services needed:**
- **Frontend:** Vercel (free tier available)
- **Backend:** Railway or Render
- **Database:** Railway PostgreSQL or Supabase

**Steps:**

1. **Deploy Database:**
   ```bash
   # Create Railway project
   railway init
   railway up
   # Note the DATABASE_URL
   ```

2. **Deploy Backend:**
   ```bash
   # Connect to Railway
   railway link
   railway add --name curiositi-server

   # Set environment variables
   railway variables set DATABASE_URL=your-db-url
   railway variables set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
   railway variables set TRUSTED_ORIGINS=https://your-frontend.vercel.app

   # Deploy
   railway up
   ```

3. **Deploy Frontend:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy from web directory
   cd apps/web
   vercel --prod

   # Set environment variables
   vercel env add NEXT_PUBLIC_SERVER_URL
   vercel env add NEXT_PUBLIC_BASE_URL
   ```

### Option 2: Docker Compose (Self-Hosted)

**Best for:** Full control, custom infrastructure

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: curiositi
      POSTGRES_USER: curiositi
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U curiositi"]
      interval: 10s
      timeout: 5s
      retries: 5

  server:
    build: ./apps/server
    environment:
      DATABASE_URL: postgres://curiositi:${DB_PASSWORD}@postgres:5432/curiositi
      BETTER_AUTH_SECRET: ${AUTH_SECRET}
      TRUSTED_ORIGINS: ${TRUSTED_ORIGINS}
      PORT: 3030
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3030/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build: ./apps/web
    environment:
      NEXT_PUBLIC_SERVER_URL: http://server:3030
      NEXT_PUBLIC_BASE_URL: ${BASE_URL}
    depends_on:
      server:
        condition: service_healthy
    ports:
      - "3040:3000"

volumes:
  postgres_data:
```

**Deploy:**
```bash
# Set environment variables
export DB_PASSWORD=your-secure-password
export AUTH_SECRET=$(openssl rand -base64 32)
export TRUSTED_ORIGINS=https://your-domain.com
export BASE_URL=https://your-domain.com

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec server bun run db:migrate
```

### Option 3: Kubernetes

**Best for:** Enterprise deployments, high availability

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: curiositi-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: curiositi-server
  template:
    metadata:
      labels:
        app: curiositi-server
    spec:
      containers:
      - name: server
        image: your-registry/curiositi-server:latest
        ports:
        - containerPort: 3030
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: curiositi-secrets
              key: database-url
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: curiositi-secrets
              key: auth-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3030
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3030
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: curiositi-server
spec:
  selector:
    app: curiositi-server
  ports:
    - port: 3030
      targetPort: 3030
  type: ClusterIP
```

## Build Process

### Local Build

```bash
# Install dependencies
bun install --frozen-lockfile

# Run quality checks
bun run typecheck
bun run lint

# Build all applications
bun run build
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Type check
        run: bun run typecheck

      - name: Lint
        run: bun run lint

      - name: Build applications
        run: bun run build

      - name: Run tests
        run: bun run test

      - name: Build and push Docker images
        run: |
          docker build -t your-registry/curiositi-server ./apps/server
          docker build -t your-registry/curiositi-web ./apps/web
          docker push your-registry/curiositi-server
          docker push your-registry/curiositi-web

      - name: Deploy to production
        run: |
          # Your deployment commands here
          # kubectl apply -f k8s/
          # docker-compose up -d
          # vercel --prod
```

## Environment Configuration

### Required Variables

```bash
# Server (.env)
PORT=3030
HOST=https://your-domain.com
DATABASE_URL=postgres://user:pass@host:5432/db
BETTER_AUTH_SECRET=your-32-char-secret
TRUSTED_ORIGINS=https://your-frontend.com,https://your-api.com

# Optional: AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
FIRECRAWL_API_KEY=fc-...

# Optional: Email
RESEND_API_KEY=re_...

# Optional: Monitoring
SENTRY_DSN=https://...
```

```bash
# Web (.env)
NEXT_PUBLIC_BASE_URL=https://your-frontend.com
NEXT_PUBLIC_SERVER_URL=https://your-api.com
```

### Environment Validation

```typescript
// apps/server/src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3030'),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  TRUSTED_ORIGINS: z.string(),
  // Add other validations
});

export const env = envSchema.parse(process.env);
```

## Scaling Strategies

### Horizontal Scaling

**Server Scaling:**
- Curiositi server is stateless
- Scale by adding more instances behind a load balancer
- Use Kubernetes Deployments or Docker Swarm

**Database Scaling:**
- Add read replicas for search queries
- Use connection pooling (pgBouncer)
- Consider partitioning for very large datasets

### Vertical Scaling

**Memory Considerations:**
- Each concurrent request needs memory for LLM processing
- File uploads require memory for processing
- Monitor and adjust instance sizes accordingly

**Storage Scaling:**
- Use external object storage (S3, MinIO) for file uploads
- Implement CDN for static assets
- Regular cleanup of temporary files

### Performance Optimization

**Database:**
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_files_space_id ON files(space_id);
CREATE INDEX CONCURRENTLY idx_messages_thread_id ON messages(thread_id);
CREATE INDEX CONCURRENTLY idx_file_chunks_file_id ON file_chunks(file_id);

-- Optimize vector search
CREATE INDEX CONCURRENTLY idx_file_chunks_embedding ON file_chunks
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

**Caching:**
```typescript
// Redis for session storage (optional)
import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL);

// Cache embeddings or search results
const cache = new Redis(process.env.REDIS_URL);
```

## Monitoring & Observability

### Health Checks

```typescript
// apps/server/src/routes/health.ts
import { Hono } from 'hono';
import db from '@/db';

const healthRouter = new Hono();

healthRouter.get('/', async (c) => {
  try {
    // Check database connectivity
    await db.execute('SELECT 1');

    // Check external services
    if (process.env.FIRECRAWL_API_KEY) {
      // Test Firecrawl connectivity
    }

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, 503);
  }
});

export default healthRouter;
```

### Logging

```typescript
// Structured logging
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage
logger.info({ userId, action: 'file_upload' }, 'File uploaded successfully');
```

### Metrics

```typescript
// Prometheus metrics
import { collectDefaultMetrics, register, Gauge } from 'prom-client';

collectDefaultMetrics();

const activeConnections = new Gauge({
  name: 'curiositi_active_connections',
  help: 'Number of active connections',
});

const searchLatency = new Gauge({
  name: 'curiositi_search_latency_seconds',
  help: 'Search request latency',
});

// Expose metrics endpoint
app.get('/metrics', async (c) => {
  return c.text(await register.metrics());
});
```

### Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/bun';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error boundary
export const errorHandler = Sentry.setupHonoErrorHandler;
```

## Backup & Recovery

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql

# Upload to S3
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/

# Clean old backups (keep last 30 days)
aws s3 ls s3://your-backup-bucket/ | while read -r line; do
  createDate=$(echo $line | awk '{print $1" "$2}')
  createDate=$(date -d"$createDate" +%s)
  olderThan=$(date -d'30 days ago' +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk '{print $4}')
    aws s3 rm s3://your-backup-bucket/$fileName
  fi
done
```

### File Backups

```bash
# Backup uploaded files
tar -czf files_backup_$DATE.tar.gz /path/to/uploads/
aws s3 cp files_backup_$DATE.tar.gz s3://your-backup-bucket/
```

### Disaster Recovery

1. **Spin up new infrastructure**
2. **Restore database from backup**
3. **Restore files from backup**
4. **Update DNS to point to new infrastructure**
5. **Verify application functionality**

## Security Hardening

### Network Security

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3040;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Application Security

```typescript
// Rate limiting
import { rateLimit } from 'hono/rate-limiter';

app.use('/api/*', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));

// Input validation
import { zValidator } from '@hono/zod-validator';

app.post('/api/v1/search', zValidator('json', searchSchema), async (c) => {
  // Safe to use c.req.valid('json')
});
```

### Secret Management

```bash
# Use external secret management
# AWS Secrets Manager, HashiCorp Vault, etc.

# Never commit secrets to code
# Use .env files only for development
# Inject secrets at runtime in production
```

## Troubleshooting Production Issues

### Performance Issues

**High Memory Usage:**
- Check for memory leaks in LLM processing
- Monitor concurrent request limits
- Consider increasing instance size

**Slow Database Queries:**
- Add missing indexes
- Optimize vector search parameters
- Consider database scaling

**Slow File Processing:**
- Check disk I/O performance
- Monitor memory during file processing
- Consider background processing queues

### Common Deployment Errors

**Database Connection Failed:**
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Verify pgvector extension
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

**Build Failures:**
```bash
# Clear build cache
bun run clean

# Check Node.js/Bun version compatibility
bun --version

# Verify all dependencies
bun install --frozen-lockfile
```

**SSL/HTTPS Issues:**
```bash
# Test certificate
openssl s_client -connect your-domain.com:443

# Check redirect configuration
curl -I http://your-domain.com
```

## Cost Optimization

### Infrastructure Costs

**Compute:**
- Use spot instances for non-critical workloads
- Implement auto-scaling based on metrics
- Choose instance types optimized for your workload

**Storage:**
- Use object storage for file uploads
- Implement data lifecycle policies
- Compress and deduplicate stored files

**Database:**
- Right-size database instances
- Use read replicas for read-heavy workloads
- Implement connection pooling

### AI Costs

**LLM Optimization:**
- Implement response caching
- Use smaller models for simple queries
- Monitor token usage and optimize prompts

**Embedding Costs:**
- Cache embeddings for unchanged documents
- Implement incremental updates
- Use efficient embedding models

## Migration Strategies

### From Development to Production

1. **Environment Setup:** Configure production environment variables
2. **Database Migration:** Run migrations on production database
3. **Data Migration:** Import development data if needed
4. **DNS Configuration:** Point domain to production infrastructure
5. **SSL Setup:** Configure HTTPS certificates
6. **Monitoring:** Set up logging and monitoring

### Blue-Green Deployment

```bash
# Create new environment
docker-compose -f docker-compose.green.yml up -d

# Run migrations on green environment
docker-compose -f docker-compose.green.yml exec server bun run db:migrate

# Test green environment
curl https://green.your-domain.com/health

# Switch traffic (update load balancer)
# Monitor for issues
# Tear down blue environment if successful
```

This deployment guide provides a comprehensive foundation for running Curiositi in production. Adapt these patterns to your specific infrastructure and requirements.
