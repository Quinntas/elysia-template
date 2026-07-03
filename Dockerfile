FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --system --create-home --uid 1001 appuser

COPY --from=builder /app/server ./server

RUN chown appuser:appuser /app/server

USER appuser

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["curl", "--fail", "--silent", "http://127.0.0.1:3000/"]

CMD ["./server"]
