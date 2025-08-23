/**
 * Jest setup file for recomposer tests
 */

// Set up global test timeout
jest.setTimeout(10000);

// Mock uuid to return predictable values in tests
jest.mock('uuid', () => ({
  v4: jest.fn().mockImplementation(() => 'test-uuid-1234'),
}));

// Global beforeAll hook
beforeAll(() => {
  // Any global setup needed before all tests
  console.log('Starting recomposer test suite');
});

// Global afterAll hook
afterAll(() => {
  // Any global cleanup needed after all tests
  console.log('Completed recomposer test suite');
});
