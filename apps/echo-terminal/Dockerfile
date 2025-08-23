# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml package.json turbo.json tsconfig.base.json tsconfig.json .npmrc* ./
COPY packages ./packages
COPY apps ./apps
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm --filter ./apps/echo-terminal... build

FROM deps AS deploy
RUN pnpm deploy --filter ./apps/echo-terminal... --prod /app/out

FROM base AS runner
WORKDIR /app
COPY --from=deploy /app/out /app
ENV NODE_ENV=production
RUN chown -R node:node /app
USER node
CMD ["node", "dist/index.js"]
