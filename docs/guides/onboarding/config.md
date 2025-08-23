# Configuration Guide

## Overview

All applications in the EchoForge workspace use centralized configuration through `@org/config`. This ensures consistent environment variable handling and validation across the entire ecosystem.

## Usage

### In Applications

```typescript
import { config } from '@org/config';

// Access validated configuration
const port = config.PORT;
const nodeEnv = config.NODE_ENV;
const logLevel = config.LOG_LEVEL;
```

### Environment Variables

Each application has an `.env.example` file showing required environment variables:

```bash
# Copy the example file
cp apps/dashboard/.env.example apps/dashboard/.env

# Edit with your values
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
SERVICE_NAME=dashboard
```

## Configuration Schema

The `@org/config` package uses Zod for runtime validation:

- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `SERVICE_NAME`: Application identifier for logging

## Best Practices

1. **Never use `dotenv.config()` directly** - Always go through `@org/config`
2. **Add new variables to the schema** - Update `@org/config/src/index.ts`
3. **Update .env.example files** - Keep them in sync with schema changes
4. **Use SERVICE_NAME** - Required for proper log correlation

## Migration from Direct dotenv

If you find code using `dotenv.config()` directly:

```typescript
// ❌ Old way
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT;

// ✅ New way
import { config } from '@org/config';
const port = config.PORT;
```

This provides type safety, validation, and consistent defaults across all applications.