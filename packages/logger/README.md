# @org/logger

Standardized logging solution for EchoForge applications. This package provides consistent logging with structured output, service identification, and request correlation.

> **⚠️ Import Boundary:** Only import from package root (`@org/logger`). Do not import from internal paths like `@org/logger/src/*` or `@org/logger/dist/*`.

## Purpose

The logger package provides a unified logging interface across all EchoForge applications and packages. It uses Pino for high-performance structured logging with consistent field naming and formatting.

## Usage

```typescript
import { logger } from '@org/logger';

// Basic logging
logger.info('Application started');
logger.error('Something went wrong', { error: err });

// With context
logger.child({ requestId: 'req-123' }).info('Processing request');
```

## Features

- High-performance structured logging with Pino
- Consistent field naming across services
- Request correlation with requestId
- Service identification with serviceName
- Version and commit tracking
- Environment-aware log levels

## Standard Fields

- `serviceName`: Application identifier (from SERVICE_NAME env var)
- `version`: Application version
- `commit`: Git commit hash
- `requestId`: Request correlation ID
- `timestamp`: ISO 8601 timestamp
- `level`: Log level (debug, info, warn, error)

## Configuration

The logger automatically configures itself based on environment variables managed by `@org/config`:

- `LOG_LEVEL`: Controls logging verbosity
- `SERVICE_NAME`: Identifies the service in logs
- `NODE_ENV`: Affects log formatting (pretty in development)