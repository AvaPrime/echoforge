# Testing Strategy for @echoforge/recomposer

## Overview

This document outlines the testing strategy for the @echoforge/recomposer package, which is a critical component of the EchoForge platform. The testing approach ensures that the package's core functionality is reliable, maintainable, and behaves as expected.

## Test Coverage Goals

- **Overall Coverage Target**: 75%+ line coverage
- **Critical Components**: 80%+ coverage for core classes
- **Edge Cases**: Comprehensive testing of conflict resolution strategies

## Test Structure

Tests are organized in the `src/__tests__` directory, mirroring the structure of the source code:

```
src/
├── __tests__/
│   ├── setup/
│   │   ├── testUtils.ts     # Common test utilities and mock data
│   │   └── jest.setup.js    # Jest configuration
│   ├── BlueprintComposer.test.ts
│   ├── CapabilityExtractor.test.ts
│   ├── BlueprintDiff.test.ts
│   ├── CompositionOptions.test.ts
│   ├── ExtractionOptions.test.ts
│   └── DiffResult.test.ts
```

## Core Components Tested

1. **BlueprintComposer**
   - Blueprint merging with different conflict strategies
   - Lineage maintenance
   - Auto-refinement
   - Individual component merging (capabilities, intents, etc.)

2. **CapabilityExtractor**
   - Extraction by function name and intent tag
   - Minimal viable module generation
   - Related function inclusion
   - Refinement annotation handling

3. **BlueprintDiff**
   - Change detection across all blueprint components
   - Similarity scoring
   - Narrative generation
   - Change filtering and categorization

4. **Supporting Classes**
   - CompositionOptions validation
   - ExtractionOptions validation
   - DiffResult change tracking and retrieval

## Testing Tools

- **Jest**: Primary testing framework
- **ts-jest**: TypeScript integration
- **Coverage Reports**: HTML, LCOV, and JSON summary formats

## Running Tests

The following npm scripts are available for testing:

```bash
# Run all tests
npm test

# Run tests with coverage reporting
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch

# Run tests in CI environment
npm run test:ci
```

Alternatively, use the provided script for a more detailed output:

```bash
node run-tests.js
```

## Continuous Integration

Tests are automatically run as part of the CI/CD pipeline. The workflow:

1. Runs linting and type checking
2. Executes the test suite with coverage reporting
3. Uploads coverage reports to Codecov
4. Fails the build if coverage thresholds are not met

## Future Improvements

- Integration tests with the ValidatorEngine
- Performance benchmarks for large blueprint compositions
- Property-based testing for complex merge scenarios
- Snapshot testing for diffing narratives

## Contributing Tests

When adding new features or fixing bugs:

1. Add or update tests to cover the changes
2. Ensure all tests pass before submitting a PR
3. Maintain or improve the overall coverage percentage
4. Include edge cases in your test scenarios
