import { describe, expect, it } from 'vitest';
import { API_V1_BASE } from './api/base';

describe('admin-panel smoke', () => {
  it('provides a valid API base path', () => {
    expect(typeof API_V1_BASE).toBe('string');
    expect(API_V1_BASE.length).toBeGreaterThan(0);
  });
});
