# Echoforge Helm Chart

## Install

```bash
helm upgrade --install echoforge charts/echoforge \
  --set global.registry=ghcr.io/echoforge \
  --set global.tag=latest \
  --set ingress.hosts.dashboard=dashboard.example.com \
  --set ingress.hosts.api=api.example.com
```

## Values

- `global.registry`: image registry
- `global.tag`: image tag
- `echoCloud.replicaCount`: replicas for echo-cloud
- `dashboard.replicaCount`: replicas for dashboard
- `echoCloud.env.*`: env vars for echo-cloud
- `dashboard.env.*`: env vars for dashboard
- `ingress.enabled`: create ingress
- `ingress.className`: ingress class (e.g., nginx)
- `ingress.tls.*`: TLS settings
