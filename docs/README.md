# EchoForge Packages

This directory contains all EchoForge packages organized into logical groups for better maintainability and development experience.

## Structure

### Core Packages (`/core`)
Fundamental packages that provide essential functionality:
- **echocore** - Core EchoForge functionality and utilities
- **logger** - Centralized logging system
- **forgekit** - Core development toolkit

### UI Packages (`/ui`)
User interface components and libraries:
- **echoui** - Shared UI components and design system

### Tools Packages (`/tools`)
Development tools and utilities:
- **codalism** - Code analysis and transformation tools
- **codessa** - Code assessment and validation
- **env-check** - Environment validation and setup
- **mirror** - Code mirroring and synchronization
- **recomposer** - Code recomposition utilities

### Shared Packages (`/shared`)
Shared utilities and configurations:
- **blueprint** - Project blueprints and templates
- **validator** - Validation utilities and schemas
- **config** - Shared configuration files

## Development

Each package is independently versioned and can be developed, tested, and deployed separately while maintaining proper dependency relationships.

## Package Guidelines

1. Each package should have a clear, single responsibility
2. Dependencies between packages should be minimal and well-defined
3. All packages should follow the same coding standards and conventions
4. Each package should include comprehensive tests and documentation