
FROM oven/bun:latest AS deps
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM oven/bun:latest AS builder

WORKDIR /app

COPY . .

RUN bun run build

FROM oven/bun:latest AS runner

WORKDIR /app

ENV NODE_ENV production

EXPOSE 3040

ENV PORT 3040

CMD ["bun", "run", "start"] 