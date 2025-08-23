# Contributing

Thanks for helping improve Echoforge! This repo is a pnpm/turbo monorepo. Please read `AGENTS.md` first for structure, commands, and conventions.

## Quick Start

- Install tools: `pnpm -v` (v9) and Git.
- Install deps: `pnpm install` (sets up Husky hooks; builds filtered packages postinstall).
- Run all apps/packages in dev: `pnpm dev`.
- Target a workspace: `pnpm --filter @echoforge/<name> <cmd>` (e.g., `build`, `dev`, `test`).

## Making Changes

- Branch: `feat/<scope>`, `fix/<scope>`, or `chore/<scope>`.
- Code style: run `pnpm lint` and `pnpm format` before committing.
- Tests: add/adjust `*.test.ts` and ensure `pnpm test:run` (or `pnpm test:coverage`) passes.
- Scope changes to a single workspace when possible; update docs if behavior changes.

## Project Structure

- Apps in `apps/*`, shared libraries in `packages/*`, agents/utilities in `agents/`, scripts in `scripts/`, docs in `docs/`.
- Python utilities live under `echoforge/` (see `requirements.txt` if you touch them).

## Pull Requests

- Use the PR template (`.github/PULL_REQUEST_TEMPLATE.md`).
- Include: summary, linked issues, testing notes, and screenshots for UI changes.
- CI expectations: repository builds (`pnpm build`) and tests pass (`pnpm test:run`).

## Issues

- Use issue templates under `.github/ISSUE_TEMPLATE/` (bug report, feature request).
- For questions, use Discussions (see `config.yml` contact link).

See `AGENTS.md` for detailed repository guidelines.
