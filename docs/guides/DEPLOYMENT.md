# Deployment Guide

This guide covers building and running EchoForge apps with Docker, plus recommended practices for production.

## Echo Terminal (CLI) Container

- Dockerfile: `apps/echo-terminal/Dockerfile`

### Build

```bash
# From repo root
docker build -t echoforge/echo-terminal -f apps/echo-terminal/Dockerfile .
```

### Run

```bash
# Run with default start script
docker run --rm -it echoforge/echo-terminal

# Pass env vars (avoid committing secrets)
docker run --rm -it --env-file .env echoforge/echo-terminal

# Mount local workspace (optional for development)
docker run --rm -it -v %cd%:/app echoforge/echo-terminal  # Windows PowerShell
# docker run --rm -it -v "$(pwd)":/app echoforge/echo-terminal  # macOS/Linux
```

### Multi-arch Build (optional)

```bash
# Requires Docker Buildx
docker buildx build --platform linux/amd64,linux/arm64 \
  -t echoforge/echo-terminal:latest \
  -f apps/echo-terminal/Dockerfile .
```

## Environment & Secrets

- Local development: use `.env` (see `.env.example`).
- Production: use a secret manager (e.g., GCP Secret Manager). Do not bake secrets into images.

## Dashboard (Next.js) Notes

- Dockerfile: `apps/dashboard/Dockerfile`
- At runtime, configure public env vars via `NEXT_PUBLIC_*` (baked at build) and server env vars via process env.

Common vars:

```bash
NEXT_PUBLIC_API_BASE=https://api.example.com
NODE_ENV=production
PORT=3000
```

Run example:

```bash
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE=https://api.example.com \
  echoforge/dashboard:latest
```

## CI/CD Notes

- CI runs lint, typecheck, build, and tests with coverage (see `.github/workflows/ci.yml`).
- Release workflow (Changesets) opens a version PR and can publish to npm when `NPM_TOKEN` is configured.
- Docker images: `.github/workflows/docker-ghcr.yml` builds multi-arch images on tags like `v1.2.3` and pushes to GHCR.
- Turbo remote cache: set repo secrets `TURBO_TOKEN` (and optional `TURBO_TEAM`) to speed up Turbo builds in CI.
- CI prints a cache status message in the job summary (enabled/not configured) for visibility.

### GHCR Images

Images are published to `ghcr.io/<owner>/<app>`:

- `ghcr.io/<owner>/echo-terminal`
- `ghcr.io/<owner>/echo-cloud`
- `ghcr.io/<owner>/dashboard`

Tags:

- `latest` and the pushed tag (e.g., `v1.2.3`).

Pull example:

```bash
docker pull ghcr.io/<owner>/echo-terminal:latest
```

### Docker Hub Images

Workflow: `.github/workflows/docker-dockerhub.yml` (tags `v*.*.*`)

Required secrets:

- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` (Create a Docker Hub access token)
- `DOCKERHUB_ORG` (your Docker Hub org or username)

Tags:

- `docker.io/$DOCKERHUB_ORG/<app>:<version>` and `:latest`

Pull example:

```bash
docker pull docker.io/<org-or-user>/echo-cloud:latest
```

### Image Hardening

- Non-root user enforced in final images.
- `libc6-compat` installed for better native module compatibility on Alpine.
- Healthchecks added for services on port 3000 (Echo Cloud, Dashboard).

## Kubernetes Manifests

- Location: `deploy/k8s/`
  - `echo-cloud.yaml`: Deployment (2 replicas) + Service (ClusterIP). TCP liveness/readiness on 3000.
  - `dashboard.yaml`: Deployment (2 replicas) + Service (ClusterIP). HTTP liveness/readiness on `/`.
  - `echo-terminal-job.yaml`: Job template for running the CLI once.

Security baseline:

- Non-root (`runAsUser: 10001`, `readOnlyRootFilesystem: true`, drop all capabilities).
- Resource requests/limits included; tune per environment.

Images default to GHCR `ghcr.io/echoforge/<app>:latest`; adjust to your org/registry as needed.

## Helm Chart

- Path: `charts/echoforge`
- Quick install:

```bash
helm upgrade --install echoforge charts/echoforge \
  --set global.registry=ghcr.io/echoforge \
  --set global.tag=latest \
  --set ingress.hosts.dashboard=dashboard.example.com \
  --set ingress.hosts.api=api.example.com
```

- Customize replicas/env in `values.yaml` or with `--set` flags.
- Staging overlay: `charts/echoforge/values-staging.yaml` (enables canary, sets local hosts)
  ```bash
  helm upgrade --install echoforge charts/echoforge \
    -f charts/echoforge/values-staging.yaml \
    --set global.registry=ghcr.io/echoforge --set global.tag=latest
  ```
- Production overlay example: `charts/echoforge/values-prod.yaml.example`
  - Copy to `values-prod.yaml`, customize registry, tag, domains, and TLS secret
  - Create TLS secret (example for NGINX Ingress):
    ```bash
    kubectl create secret tls echoforge-tls \
      --cert=path/to/fullchain.pem \
      --key=path/to/privkey.pem
    ```
  - Install:
    ```bash
    helm upgrade --install echoforge charts/echoforge \
      -f charts/echoforge/values-prod.yaml
    ```
- NGINX + cert-manager overlay: `charts/echoforge/values-nginx-certmanager.yaml.example`
- GKE overlay: `charts/echoforge/values-gke.yaml.example` (uses ManagedCertificate)

## Monitoring

- Echo Cloud exposes Prometheus metrics at `/metrics`.
- Enable ServiceMonitor by setting `monitoring.enabled=true` in values.
- To scrape Dashboard metrics at `/api/metrics`, also set `monitoring.dashboardEnabled=true`.
- The `ServiceMonitor` expects Prometheus Operator CRDs (`monitoring.coreos.com`).
- A sample Grafana dashboard JSON is available under `monitoring/grafana/dashboards/echoforge-overview.json`.

## Helper Scripts

- `scripts/secrets-from-env.sh <ns> <secret-name> [.env]`: create/apply a Secret from an env file.
- `scripts/rollback.sh [release]`: show Helm history and rollback interactively.
- `scripts/smoke.sh`: curl health/metrics for dashboard and API (configure `HOST_DASH`/`HOST_API`).

### Canary Releases

- Enable header-based canary with `X-Canary` using values:

```bash
helm upgrade --install echoforge charts/echoforge \
  --set ingress.canary.enabled=true \
  --set ingress.canary.header=X-Canary
```

## Makefile Shortcuts

- `make setup|dev|build|test|coverage|lint|format|typecheck|e2e`
- Build an image: `make docker-ghcr APP=echo-cloud TAG=v0.1.0`
- Install chart: `make helm-install REGISTRY=ghcr.io/echoforge TAG=v0.1.0 DASH_HOST=dashboard.example.com API_HOST=api.example.com`

### Publishing the Chart

- Workflow: `.github/workflows/helm-release.yml`
- Trigger: push a tag like `charts-v0.1.0`
- Output: packaged chart and `index.yaml` published to GitHub Pages via Releases

Setup steps:

- Ensure GitHub Pages is enabled for the repo (Build from GitHub Actions).
- Create a tag `charts-vX.Y.Z` and push; the workflow will publish.

### Auto-bump Chart on App Release

- Workflow: `.github/workflows/bump-chart-on-release.yml`
- Trigger: pushing a tag `vX.Y.Z`
- Action: opens a PR to set chart `appVersion` to the app tag; merge, then tag `charts-vX.Y.Z` to publish the chart.

### Security Scans

- Workflow: `.github/workflows/security-scan.yml` runs on PRs:
  - Trivy FS scan (vulns/secrets/misconfig) across the repo
  - Helm lint on `charts/echoforge`

## Recommendations

- Pin image tags per release (e.g., `echoforge/echo-terminal:v0.1.x`).
- Add health checks for web services (apps with HTTP surfaces) and expose ports in their Dockerfiles.
- Enable Turbo remote caching for faster CI (set `TURBO_TOKEN`).
