# End-to-End Testing

This directory contains end-to-end tests for EchoForge applications using Playwright.

## Setup

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm install-browsers
```

## Running Tests

```bash
# Run all e2e tests
pnpm test

# Run tests in headed mode (visible browser)
pnpm test:headed

# Run tests with UI mode
pnpm test:ui

# Debug tests
pnpm test:debug

# View test report
pnpm report
```

## From Root Directory

```bash
# Run e2e tests from project root
pnpm e2e

# Run with headed browser
pnpm e2e:headed

# Run with UI mode
pnpm e2e:ui
```

## Test Structure

- `tests/` - Test files (*.spec.ts)
- `playwright.config.ts` - Playwright configuration
- `playwright-report/` - Generated test reports
- `test-results/` - Test artifacts and screenshots

## Writing Tests

Tests are written using Playwright's test framework:

```typescript
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Expected Title/);
});
```

## CI Integration

E2E tests run automatically in CI for:
- Pull requests
- Main branch pushes

Tests run after the main validation job completes successfully.