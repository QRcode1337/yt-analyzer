# Testing Guide

## Overview

This project uses **Vitest** as the testing framework with **Testing Library** for component testing.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Structure

```
tests/
  setup.ts              # Global test setup
lib/
  schemas/
    analysis-schemas.test.ts   # Schema validation tests
  utils/
    youtube.test.ts            # Utility function tests
inngest/
  functions/
    analyze-video.test.ts      # Inngest function tests
```

## Coverage Targets

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **Critical Paths**: 100% coverage

Current thresholds (enforced):
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## Test Categories

### 1. Unit Tests

Test individual functions and schemas in isolation.

**Example:**
```typescript
import { describe, it, expect } from 'vitest'
import { HeroJourneySchema } from './analysis-schemas'

describe('HeroJourneySchema', () => {
  it('should validate 6 beats', () => {
    const validJourney = {
      beats: Array.from({ length: 6 }, (_, i) => ({
        number: i + 1,
        title: `Beat ${i + 1}`,
        description: 'Description',
        timeRange: { start: '00:00', end: '00:30' },
      })),
    }

    const result = HeroJourneySchema.safeParse(validJourney)
    expect(result.success).toBe(true)
  })
})
```

### 2. Integration Tests

Test multiple components working together.

**Priority Areas:**
- Video ingestion flow
- Analysis function with database
- Transcript → Analysis → Export pipeline

### 3. E2E Tests (Future)

Full user workflows from UI through backend.

**Recommended Stack:**
- Playwright for browser automation
- Test real API endpoints
- Validate full user journeys

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts` or `*.spec.ts`
- Component tests: `*.test.tsx` or `*.spec.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### Best Practices

1. **Arrange-Act-Assert Pattern**
```typescript
it('should do something', () => {
  // Arrange
  const input = 'test'

  // Act
  const result = myFunction(input)

  // Assert
  expect(result).toBe('expected')
})
```

2. **Descriptive Test Names**
```typescript
// ✅ Good
it('should reject beat with number less than 1', () => {})

// ❌ Bad
it('validates number', () => {})
```

3. **Test Edge Cases**
- Empty strings
- Null/undefined values
- Boundary values (min/max)
- Invalid formats

4. **Mock External Dependencies**
```typescript
import { vi } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch
```

## Priority Test Files to Create

Based on code analysis, these are the highest priority:

### Critical (Must Have)
1. ✅ `lib/schemas/analysis-schemas.test.ts` - Schema validation
2. ✅ `lib/utils/youtube.test.ts` - YouTube ID extraction
3. ✅ `inngest/functions/analyze-video.test.ts` - Analysis function

### High Priority (Should Have)
4. `app/api/videos/ingest/route.test.ts` - Video ingestion
5. `app/api/analysis/[id]/export/route.test.ts` - Blueprint export
6. `components/TranscriptInput.test.tsx` - Transcript upload

### Medium Priority (Nice to Have)
7. `lib/prompts/section-prompts.test.ts` - Prompt generation
8. `components/analysis/*.test.tsx` - Tab components
9. `app/analysis/[id]/AnalysisPageClient.test.tsx` - Main client component

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run tests
  run: npm run test:run

- name: Check coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests fail with module resolution errors

Ensure `vitest.config.ts` has the correct path aliases:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

### Tests timeout

Increase timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000,  // 10 seconds
}
```

### Coverage doesn't meet thresholds

Run with coverage to see what's missing:
```bash
npm run test:coverage
```

Open `coverage/index.html` in your browser to see detailed coverage report.

## Next Steps

1. **Install dependencies**: `npm install`
2. **Run initial tests**: `npm run test`
3. **Add more tests** for critical paths
4. **Set up CI/CD** with test automation
5. **Monitor coverage** and improve over time

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
