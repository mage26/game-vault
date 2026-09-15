<h1 align="center">GAME VAULT</h1>

<p align="center">Browse and search games using the <a href="https://www.igdb.com/api">IGDB API</a>.</p>

## Overview

Game Vault is an npm-workspaces monorepo with two independently deployed apps and a shared types package:

```
apps/
  api/            NestJS API — proxies/aggregates the IGDB API (deployed to AWS)
  web/             Next.js 15 (App Router) frontend (deployed to Vercel)
packages/
  types/          Shared TypeScript interfaces (MappedGame, MappedPlatform)
```

- **apps/api** authenticates against IGDB (via Twitch's OAuth2 client-credentials flow), caches the access token in memory, and exposes a small REST API for games and platforms. It's a plain NestJS/Express server (`node dist/main.js`, listening on `$PORT`) with a `Dockerfile` for containerized AWS deployment.
- **apps/web** is a server-rendered Next.js frontend that fetches from the API, and lets users search, filter by platform, and favorite games (stored in `localStorage`).
- **packages/types** holds the `MappedGame` / `MappedPlatform` interfaces shared by both apps (referenced as `@game-vault/types`).

The two apps are deployed separately and talk to each other over HTTP across origins — there's no shared domain or reverse proxy between them, so `API_URL` (web → api) and `WEB_ORIGIN` (api's CORS allow-list) must point at each other's real deployed URLs in production.

## Requirements

- Node.js >= 20.9
- npm >= 11 (workspaces are used for dependency management — install once from the repo root)
- An IGDB/Twitch application: [client ID and secret](https://api-docs.igdb.com/#account-creation)

## Setup

Install dependencies for all workspaces from the repo root:

```bash
npm install
```

Create `apps/api/.env` with your IGDB credentials:

```
IGDB_CLIENT_ID=your_twitch_client_id
IGDB_CLIENT_SECRET=your_twitch_client_secret
```

## Development

Run each app in its own terminal:

```bash
npm run dev:api   # NestJS API on http://localhost:3000 (routes prefixed with /api)
npm run dev:web   # Next.js frontend on http://localhost:3001
```

The web app talks to the API at `http://localhost:3000/api` by default (see `apps/web/lib/api.ts`), and the API allows CORS from `http://localhost:3001` by default. Override either with the `API_URL` (web) or `WEB_ORIGIN` (api) environment variables.

## Building

```bash
npm run build       # builds both apps (build:api + build:web)
npm run build:api   # apps/api -> apps/api/dist
npm run build:web   # apps/web -> apps/web/.next
```

## API

All routes are served under the `/api` prefix.

| Method | Path                 | Query params           | Description                                  |
| ------ | -------------------- | ----------------------- | --------------------------------------------- |
| GET    | `/api/games/games`    | `platform?`             | List games, optionally filtered by platform id |
| GET    | `/api/games/search`   | `q`, `platform?`        | Search games by name                          |
| GET    | `/api/games/by-ids`   | `ids` (comma-separated), `platform?` | Fetch specific games by IGDB id  |
| GET    | `/api/games/platforms`| —                       | List the supported platforms                  |

The set of platforms surfaced (and used as the default filter) is configured in `apps/api/src/config/configuration.ts`.

## Testing (API)

```bash
npm test --workspace=apps/api        # unit tests
npm run test:e2e --workspace=apps/api
npm run test:cov --workspace=apps/api
```

## Deployment

The frontend and API are deployed independently, on different providers.

### Frontend (Vercel)

The Vercel project's **Root Directory** is set to `apps/web`, so Vercel builds and deploys it directly with zero extra config (it auto-detects Next.js). Set this environment variable on the Vercel project:

- `API_URL` — the API's public URL, e.g. `https://api.your-domain.com/api` (must include the `/api` prefix). Without it, the web app falls back to `http://localhost:3000/api`, which won't resolve in production.

### API (AWS)

`apps/api/Dockerfile` builds a standalone container image for the API, built from the **repo root** (it needs the root lockfile and workspace `package.json` files to resolve `npm ci`):

```bash
docker build -f apps/api/Dockerfile -t game-vault-api .
docker run -p 3000:3000 \
  -e IGDB_CLIENT_ID=... -e IGDB_CLIENT_SECRET=... -e WEB_ORIGIN=https://your-app.vercel.app \
  game-vault-api
```

This image works as-is on any AWS compute that runs a container and provides `$PORT` (or defaults to `3000`) — App Runner, ECS/Fargate, Elastic Beanstalk's Docker platform, or a plain EC2 host running Docker. Set these environment variables wherever it runs:

- `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET` — required, from your IGDB/Twitch app
- `WEB_ORIGIN` — the deployed Vercel URL, so the API's CORS allow-list accepts requests from it (defaults to `http://localhost:3001`, which only works locally)
- `PORT` — optional; most AWS services set this automatically
