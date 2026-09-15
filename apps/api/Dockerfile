# Build from the repo root — the API workspace depends on the root
# package-lock.json and on packages/types for workspace resolution, e.g.:
#
#   docker build -f apps/api/Dockerfile -t game-vault-api .
#   docker run -p 3000:3000 \
#     -e IGDB_CLIENT_ID=... -e IGDB_CLIENT_SECRET=... -e WEB_ORIGIN=https://your-app.vercel.app \
#     game-vault-api
#
# This image runs the plain NestJS server (`node dist/main.js`, listening on
# $PORT) and works as-is behind AWS App Runner, ECS/Fargate, Elastic
# Beanstalk (Docker platform), or a plain EC2 host running Docker.

FROM node:20-slim AS base
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json

FROM base AS deps
RUN npm ci

FROM deps AS build
COPY apps/api apps/api
RUN npm run build --workspace=apps/api

FROM base AS deps-prod
RUN npm ci --omit=dev

FROM node:20-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=deps-prod /repo/node_modules node_modules
COPY --from=deps-prod /repo/apps/api/package.json apps/api/package.json
COPY --from=build /repo/apps/api/dist apps/api/dist

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
