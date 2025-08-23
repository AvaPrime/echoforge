# Production Readiness

This document summarizes the baseline hardening done and the remaining recommendations to operate EchoForge in production.

## What Changed

- ESLint (flat config) restored and standardized across TS/JS.
- Vitest coverage thresholds enforced (80% lines/statements, 75% functions, 70% branches).
- CI hardened: pnpm cache, Turbo cache, type-check step, coverage summary + artifact.
- Package engines defined (Node >=18, pnpm >=9).

## Operational Guidance

- Environment: use `.env` for local; never commit secrets. For cloud, use Secret Manager. Mirror `.env.example` for required keys.
- Builds: `pnpm build` (Turbo) with cache; CI runs lint → typecheck → build → tests with coverage.
- Type safety: `pnpm typecheck` runs project references.
- Package targeting: use `pnpm --filter @echoforge/<pkg> <cmd>` for scoped work.
- Turbo remote cache: set `TURBO_TOKEN` and optional `TURBO_TEAM` repo secrets to enable remote cache in CI.

## Next Steps (Recommended)

- Add release automation (Changesets) and semantic versioning per package.
- Add CODEOWNERS real teams and branch protection rules.
- Add e2e smoke tests for `apps/*` and increase coverage thresholds over time.
- Consider Dockerfiles for `apps/*` surfaces and publish images.
- Enable Turbo Remote Caching (TURBO_TOKEN) for faster CI.
- Security: add `SECURITY.md`, run `pnpm audit` in CI, and configure Dependabot.
- Add environment overlays for Helm (e.g., `values-staging.yaml`) enabling canary.
