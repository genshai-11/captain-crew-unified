import { describe, expect, test } from 'vitest';
import { AudioWave, ResultCard, RolePanel } from '../packages/shared-ui/src';

describe('shared ui package', () => {
  test('exports usable named components from the package entrypoint', () => {
    expect(typeof AudioWave).toBe('function');
    expect(typeof ResultCard).toBe('function');
    expect(typeof RolePanel).toBe('function');
  });
});
