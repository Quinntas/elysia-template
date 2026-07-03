# Elysia Template

Type-safe Bun API template built with Elysia, Better Auth, Drizzle, Postgres, and Redis.

## Stack

- Bun
- Elysia
- Better Auth
- Drizzle ORM
- PostgreSQL
- Redis
- OpenAPI via `@elysia/openapi`
- OpenTelemetry
- Oxlint + TypeScript strict mode

## Features

- Typed environment loading in `src/start/env.ts`
- Session-based auth with Better Auth
- Todo CRUD module
- OpenAPI docs at `/docs`
- Redis-backed Drizzle cache integration
- Strict TypeScript and lint rules

## Requirements

- Bun
- PostgreSQL
- Redis

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgres://user:password@localhost:5432/app
REDIS_URL=redis://localhost:6379
```

These are validated on startup by `src/start/env.ts`.

## Install

```bash
bun install
```

## Run

```bash
bun run dev
```

The app listens on `http://localhost:3000`.

## Docker

Build the image:

```bash
docker build -t elysia-template .
```

Run the container:

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgres://user:password@host.docker.internal:5432/app" \
  -e REDIS_URL="redis://host.docker.internal:6379" \
  elysia-template
```

The container includes a healthcheck against `GET /`.

## Scripts

- `bun run dev` - start the app in watch mode
- `bun run build` - build the server binary
- `bun run lint` - run oxlint
- `bun run lint:fix` - run oxlint with fixes
- `bun run format` - format the repo
- `bun run format:check` - check formatting
- `bun run check` - format, lint, and build

## API

### Health

- `GET /` - health check

### Auth

- Better Auth routes are mounted under `/auth`
- OpenAPI auth paths are exposed under `/auth/api`

### Todos

All todo routes require authentication.

- `GET /todos` - list current user todos
- `POST /todos` - create a todo
- `PUT /todos/:id` - replace a todo
- `PATCH /todos/:id` - partially update a todo
- `DELETE /todos/:id` - delete a todo

## OpenAPI Docs

- UI: `http://localhost:3000/docs`
- JSON: `http://localhost:3000/docs/json`

## Project Structure

```text
src/
  contracts/     Shared abstractions and errors
  adapters/      External integrations like Redis and Drizzle cache
  modules/       Feature modules such as todo and healthcheck
  start/         App bootstrap, auth, db, cache, env
  utils/         Shared helpers
```

## Notes

- Todo not-found cases return `404`
- The app uses a typed `env` object instead of reading `process.env` throughout the codebase
- Better Auth OpenAPI output is merged into the main Elysia OpenAPI document
