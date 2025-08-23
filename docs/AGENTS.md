# Repository Guidelines

## Project Structure & Module Organization

- Root uses `pnpm` workspaces and `turbo` for tasks.
- TypeScript packages live in `packages/*`; apps in `apps/*`.
- Agent-related experiments/utilities are in `agents/`; shared scripts in `scripts/`.
- Documentation and plans are under `docs/` and top-level `*.md` reports.
- Some Python utilities reside in `echoforge/` with supporting files; cloud SDK deps in `requirements.txt`.
- Frontend/backend tests live with code or under package-specific `__tests__` folders; legacy Python checks are in `tests/`.

## Build, Test, and Development Commands

- Install: `pnpm install` (uses `pnpm@9`).
- Dev (all): `pnpm dev` → `turbo dev` across workspaces.
- Build (all): `pnpm build` → `turbo build` across workspaces.
- Lint: `pnpm lint` (ESLint via Turbo).
- Typecheck: `pnpm typecheck` (TS project refs at root).
- Format: `pnpm format` (Prettier write).
- Test (watch): `pnpm test` (Vitest).
- Test (CI): `pnpm test:run` or with coverage `pnpm test:coverage`.
- Filter a package: `pnpm --filter <workspace> <cmd>` (e.g., `pnpm --filter @echoforge/codessa build`).

## Coding Style & Naming Conventions

- TypeScript: 2-space indent, semicolons per Prettier config.
- Naming: `camelCase` for vars/functions, `PascalCase` for types and classes, `kebab-case` for package and file names in bins.
- Linting: ESLint (`eslint.config.js`) with TypeScript plugin; fix with `pnpm lint -- --fix`.
- Formatting: Prettier (`.prettierrc`) enforced via `pnpm format` and pre-commit hooks.
- Python: follow PEP 8 (4-space indent) for any code in `echoforge/`.

## Testing Guidelines

- Framework: Vitest (see `vitest.config.ts`).
- Location: co-locate tests next to source or use `__tests__/`.
- Naming: `*.test.ts` or `*.spec.ts`.
- Coverage: run `pnpm test:coverage` (repo enforces thresholds); add tests for new behavior and bug fixes.

## Commit & Pull Request Guidelines

- Commits: imperative mood, concise scope (optionally prefix workspace, e.g., `packages/foo:`). Group related changes.
- Pre-commit: Husky + lint-staged run ESLint/Prettier; ensure a clean pass locally.
- PRs: include a clear summary, linked issue(s), and testing notes. Add screenshots for UI changes. Ensure `pnpm build` and `pnpm test:run` pass.

## Security & Configuration Tips

- Never commit secrets; use `.env` based on `.env.example` and Secret Manager for production.
- Validate GCP-related code against `requirements.txt` packages if touching Python utilities.
- CI publishes coverage summary and artifacts; avoid printing secrets in logs.
