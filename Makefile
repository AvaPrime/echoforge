SHELL := /bin/bash

.PHONY: help setup dev build test coverage lint format typecheck e2e docker-ghcr docker-hub helm-install trivy

help:
	@echo "Common targets:"
	@echo "  setup       - pnpm install"
	@echo "  dev         - turbo dev across workspaces"
	@echo "  build       - turbo build across workspaces"
	@echo "  test        - vitest (watch)"
	@echo "  coverage    - vitest run --coverage"
	@echo "  lint        - eslint via turbo"
	@echo "  format      - prettier write"
	@echo "  typecheck   - tsc -b"
	@echo "  e2e         - run repo e2e smoke tests"
	@echo "  docker-ghcr - build+tag images for GHCR (APP var)"
	@echo "  docker-hub  - build+tag images for Docker Hub (APP, ORG vars)"
	@echo "  helm-install- install chart with basic values (REGISTRY, TAG, DASH_HOST, API_HOST)"

setup:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

coverage:
	pnpm test:coverage

lint:
	pnpm lint

format:
	pnpm format

typecheck:
	pnpm typecheck

e2e:
	pnpm --filter ./e2e... test:run || pnpm test:run

# Build a specific app image for GHCR
# Usage: make docker-ghcr APP=echo-cloud TAG=v0.1.0
docker-ghcr:
	@if [ -z "$(APP)" ]; then echo "APP is required (echo-terminal|echo-cloud|dashboard)"; exit 1; fi
	docker build -t ghcr.io/$$(echo $$GITHUB_REPOSITORY_OWNER || echo echoforge)/$(APP):$${TAG:-dev} -f apps/$(APP)/Dockerfile .

# Build a specific app image for Docker Hub
# Usage: make docker-hub APP=echo-cloud ORG=myorg TAG=v0.1.0
docker-hub:
	@if [ -z "$(APP)" ] || [ -z "$(ORG)" ]; then echo "APP and ORG required"; exit 1; fi
	docker build -t docker.io/$(ORG)/$(APP):$${TAG:-dev} -f apps/$(APP)/Dockerfile .

# Install/upgrade Helm release
# Usage: make helm-install REGISTRY=ghcr.io/echoforge TAG=v0.1.0 DASH_HOST=dashboard.example.com API_HOST=api.example.com
helm-install:
	@if [ -z "$(REGISTRY)" ] || [ -z "$(TAG)" ] || [ -z "$(DASH_HOST)" ] || [ -z "$(API_HOST)" ]; then echo "REGISTRY, TAG, DASH_HOST, API_HOST required"; exit 1; fi
	helm upgrade --install echoforge charts/echoforge \
	  --set global.registry=$(REGISTRY) \
	  --set global.tag=$(TAG) \
	  --set ingress.hosts.dashboard=$(DASH_HOST) \
	  --set ingress.hosts.api=$(API_HOST)

# Run Trivy filesystem scan locally (requires trivy installed)
trivy:
	@if ! command -v trivy >/dev/null 2>&1; then echo "Trivy not found. Install: https://aquasecurity.github.io/trivy/v0.56/getting-started/installation/"; exit 1; fi
	trivy fs --scanners vuln,secret,misconfig --severity CRITICAL,HIGH --ignore-unfixed . || true
