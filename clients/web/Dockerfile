
FROM oven/bun:latest AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:latest AS builder
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY . .

RUN bun run build

FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3040

COPY --from=builder /app /app

EXPOSE 3040

CMD ["bun", "run", "start"]