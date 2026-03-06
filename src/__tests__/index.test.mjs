import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('web-vitals', async () => {
  const mod = await import('../../dist/index.mjs');

  it('exports WEB_VITALS_THRESHOLDS as an object', () => {
    assert.ok(typeof mod.WEB_VITALS_THRESHOLDS === 'object');
  });

  it('exports getWebVitalRating as a function', () => {
    assert.ok(typeof mod.getWebVitalRating === 'function');
  });

  it('exports calculateWebVitalStats as a function', () => {
    assert.ok(typeof mod.calculateWebVitalStats === 'function');
  });
});
