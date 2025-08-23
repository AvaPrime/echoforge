import { describe, it, expect } from 'vitest';
import { placeholder } from './index';

describe('@echoforge/blueprint', () => {
  it('should export placeholder', () => {
    expect(placeholder).toBe('blueprint ready');
  });
});