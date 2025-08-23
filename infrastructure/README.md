# EchoForge Infrastructure

This directory contains all infrastructure-related configurations, deployment manifests, and monitoring setup for production environments.

## Structure

### Charts (`/charts`)
Helm charts for Kubernetes deployments:
- Contains Helm charts for deploying EchoForge applications to Kubernetes clusters
- Includes values files for different environments (dev, staging, production)

### Deployment (`/deployment`)
Deployment configurations and manifests:
- **deploy** - Kubernetes manifests and deployment configurations
- ArgoCD configurations for GitOps workflows
- Environment-specific deployment scripts

### Monitoring (`/monitoring`)
Monitoring and observability setup:
- Grafana dashboards and configurations
- Prometheus monitoring rules
- Alerting configurations
- Log aggregation setup

## Deployment Process

1. **Development**: Local development using Docker Compose
2. **Staging**: Kubernetes deployment using Helm charts
3. **Production**: GitOps deployment with ArgoCD

## Monitoring Stack

- **Metrics**: Prometheus + Grafana
- **Logging**: Centralized logging with structured logs
- **Alerting**: Prometheus Alertmanager
- **Tracing**: Distributed tracing for microservices

## Security

- All secrets are managed through Kubernetes secrets or external secret management
- Network policies enforce secure communication
- RBAC controls access to resources
- Regular security scanning and updates