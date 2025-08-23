# Pull Request Checklist

## Summary

- Briefly describe the change and the motivation.

## Related Issues

- Closes #<issue-number> (add more as needed)

## Type of Change

- [ ] feat: new feature
- [ ] fix: bug fix
- [ ] refactor: code refactor (no behavior change)
- [ ] perf: performance improvement
- [ ] test: add/update tests only
- [ ] docs: documentation updates
- [ ] chore/ci: tooling or CI only
- [ ] breaking change

## Scope

- Affected workspace(s)/package(s): `@echoforge/<name>`
- Suggested filter command: `pnpm --filter @echoforge/<name> <cmd>`

## How to Test

- Commands to validate locally:
  - `pnpm build`
  - `pnpm test:run` (or `pnpm test:coverage`)
  - `pnpm lint` and `pnpm format`

## Screenshots / UI Notes (if applicable)

- Include before/after images or short clips.

## Checklist

- [ ] Code builds: `pnpm build` succeeds
- [ ] Tests pass: `pnpm test:run` (added/updated tests for changes)
- [ ] Lint/format: `pnpm lint` and `pnpm format` pass
- [ ] Scope: used `pnpm --filter` for targeted tasks where appropriate
- [ ] Docs updated: README/AGENTS.md or package docs if needed
- [ ] No secrets committed; uses `.env` (see `.env.example`)
- [ ] For breaking changes: migration notes included

<!-- Keep the template concise and actionable. -->
