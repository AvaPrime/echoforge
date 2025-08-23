# Quickstart (10 minutes)

1. Node 20.11+ (see .nvmrc): `nvm use`
2. Install: `pnpm install --frozen-lockfile`
3. Build & test: `pnpm build && pnpm test`
4. Run an app: `cp apps/echo-cloud/.env.example apps/echo-cloud/.env && pnpm --filter @org/echo-cloud dev`

## Development Workflow

- Use `pnpm` as the package manager
- Run commands from the root using `pnpm --filter <package-name> <command>`
- All packages use shared configurations from `/config`
- Internal dependencies use `workspace:*` protocol

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Clean build artifacts
pnpm clean
```

## Package Structure

- `/apps/*` - Applications (private packages)
- `/packages/*` - Shared libraries
- `/config/*` - Shared configurations
- `/scripts/*` - Build and maintenance scripts

## Getting Help

Check the CODEOWNERS file for package ownership and reach out to the appropriate team for questions.
