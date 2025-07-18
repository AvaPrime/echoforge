# EchoForge CloudSentinel

CloudSentinel is a GCP environment management agent that ensures your Google Cloud Platform infrastructure is properly configured for EchoForge operations.

## Features

- **API Management**: Automatically enables required GCP APIs
- **IAM Validation**: Validates and configures necessary IAM permissions
- **Key Rotation**: Auto-rotates service account keys and updates Secret Manager

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

```python
from echoforge import CloudSentinel

# Create CloudSentinel instance
sentinel = CloudSentinel(project_id="your-gcp-project-id")

# Ensure environment is properly configured
results = sentinel.ensure_environment()
print(f"Environment status: {results['overall_status']}")
```

### Convenience Function (Recommended for Other Agents)

```python
from echoforge import ensure_cloud_environment

# This is how other agents should call CloudSentinel
results = ensure_cloud_environment(project_id="your-gcp-project-id")
```

### Individual Operations

```python
# Ensure specific API is enabled
api_enabled = sentinel.ensure_api("serviceusage.googleapis.com")

# Ensure service account has required role
role_assigned = sentinel.ensure_role(
    sa_email="service-account@project.iam.gserviceaccount.com",
    role="roles/secretmanager.secretAccessor"
)
```

## Required GCP APIs

CloudSentinel automatically enables these APIs:

- Service Usage API
- IAM API
- Secret Manager API
- Cloud Build API
- Cloud Resource Manager API
- Cloud Logging API
- Cloud Monitoring API

## Required IAM Roles

CloudSentinel validates these critical roles:

- `roles/secretmanager.secretAccessor`
- `roles/secretmanager.secretVersionManager`
- `roles/cloudbuild.builds.builder`
- `roles/logging.logWriter`
- `roles/monitoring.metricWriter`

## Authentication

CloudSentinel uses Google Cloud SDK default credentials. Ensure you have:

1. Installed Google Cloud SDK
2. Run `gcloud auth login` or `gcloud auth application-default login`
3. Set up service account credentials if running in production

## Environment Variables

- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account key file
- `GOOGLE_CLOUD_PROJECT`: Default GCP project ID

## Error Handling

CloudSentinel returns detailed status information including:

- APIs successfully enabled vs failed
- Valid vs missing IAM permissions
- Key rotation status
- Overall environment health

## Examples

See `examples/cloud_sentinel_example.py` for a complete usage example.
