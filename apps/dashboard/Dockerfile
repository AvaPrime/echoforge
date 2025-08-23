# ---- build ----
FROM node:20-alpine AS build
WORKDIR /repo
RUN corepack enable

# Copy only workspace manifests first (better caching)
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY config ./config
COPY apps/dashboard/package.json ./apps/dashboard/package.json
# Copy package manifests for dependencies
COPY packages/*/package.json ./packages/*/

# Install deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build app (ensure next output=standalone in next.config.js)
RUN pnpm --filter @echoforge/dashboard build

# ---- run ----
FROM node:20-alpine
WORKDIR /srv
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp
COPY --from=build /repo/apps/dashboard/.next/standalone ./
COPY --from=build /repo/apps/dashboard/public ./public
COPY --from=build /repo/apps/dashboard/.next/static ./.next/static
EXPOSE 3000
USER nodeusr
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/healthz || exit 1
CMD ["node", "server.js"]
