# EchoForge Release & Rollout Runbook

## Overview

This runbook describes how to release, deploy, canary, verify, and roll back EchoForge services using the provided CI/CD, Docker images, and Helm chart.

## Prerequisites

- CI secrets configured: `NPM_TOKEN` (optional), `TURBO_TOKEN` (and `TURBO_TEAM` if used).
- Container registry access (GHCR and/or Docker Hub) and TLS certificates for production domains.
- Kubernetes access to the target cluster with Ingress controller (NGINX or GKE Ingress).

## Release Steps

1. Land changes on `main` via PR (CI must pass; CODEOWNERS review).
2. Changesets: merge version PR to produce a repo tag `vX.Y.Z` and publish packages (if configured).
3. Images: tag `vX.Y.Z` triggers Docker workflows to build/push multi-arch images and run Trivy image scans.
4. Helm: `vX.Y.Z` tag opens a PR to bump chart `appVersion`.
5. Chart publish: tag `charts-vX.Y.Z` to publish the chart (GitHub Pages) after merging the bump PR.

## Deploy Staging (Canary Enabled)

- Install/upgrade with staging overlay:

```bash
helm upgrade --install echoforge charts/echoforge \
  -f charts/echoforge/values-staging.yaml \
  --set global.registry=ghcr.io/<org> \
  --set global.tag=vX.Y.Z
```

- Send canary traffic by adding header `X-Canary: true` in requests to your ingress host.
- Verify health endpoints:
  - Dashboard: `GET /api/healthz` returns 200 JSON
  - API: `GET /healthz` returns 200 JSON
- Smoke test user flows (UI/API) and monitor logs/metrics.

## Promote to Production

- Prepare production values from `charts/echoforge/values-prod.yaml.example` and TLS secret.
- Install/upgrade:

```bash
helm upgrade --install echoforge charts/echoforge -f charts/echoforge/values-prod.yaml
```

- Optional canary in production: enable via values and gradually increase weight or use header-based targeting.

## Rollback

- Identify last known good tag `vA.B.C`.
- Helm rollback:

```bash
helm rollback echoforge <REVISION>
# or re-upgrade with previous tag
helm upgrade echoforge charts/echoforge \
  --set global.registry=ghcr.io/<org> --set global.tag=vA.B.C
```

- In an emergency, disable canary by setting `ingress.canary.enabled=false` and re-apply.

## Observability & Health

- Probes: HTTP GET `/api/healthz` (dashboard), `/healthz` (api).
- Add app logs and metrics to your platform (e.g., GKE Cloud Logging, Prometheus).

## Security

- Non-root containers, read-only root filesystem, dropped capabilities (already configured).
- CI scans: Trivy FS on PRs; Trivy image scans on release builds.
- Secret management via K8s Secrets or cloud secret managers; do not commit secrets.

## Tips

- Use Turbo remote cache to accelerate CI (`TURBO_TOKEN`).
- Raise test coverage thresholds gradually.
- Use header-based canary for surgical testing; then weight-based for broader rollout.
