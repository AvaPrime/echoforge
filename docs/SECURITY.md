# Security Policy

## Reporting a Vulnerability

- Please email security issues to security@your-org.example (or open a private advisory on GitHub).
- Provide a minimal reproduction, affected package(s)/version(s), and impact.
- We aim to acknowledge reports within 2 business days.

## Supported Versions

- Main branch is supported; released packages follow semver once releases are enabled.

## Best Practices for Contributors

- Do not commit secrets. Use `.env` locally; for production use a secret manager.
- Avoid printing sensitive data in logs (CI publishes test output and coverage).
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm test:coverage` before pushing.
