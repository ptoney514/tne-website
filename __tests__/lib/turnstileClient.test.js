import { describe, expect, it } from 'vitest';
import {
  getTurnstileClientConfig,
  TURNSTILE_TEST_SITE_KEY,
} from '@/lib/turnstile-client.js';

describe('getTurnstileClientConfig', () => {
  it('uses the public test key outside production when no site key is configured', () => {
    expect(
      getTurnstileClientConfig({ siteKey: '', nodeEnv: 'test' })
    ).toEqual({
      siteKey: TURNSTILE_TEST_SITE_KEY,
      mode: 'test',
      error: null,
    });
  });

  it('blocks missing site key in production', () => {
    expect(
      getTurnstileClientConfig({ siteKey: '', nodeEnv: 'production' })
    ).toEqual({
      siteKey: null,
      mode: 'missing',
      error: 'Security verification is temporarily unavailable. Please contact us if this issue persists.',
    });
  });

  it('blocks the public test key in production', () => {
    expect(
      getTurnstileClientConfig({
        siteKey: TURNSTILE_TEST_SITE_KEY,
        nodeEnv: 'production',
      })
    ).toEqual({
      siteKey: null,
      mode: 'invalid_test_key',
      error: 'Security verification is temporarily unavailable. Please contact us if this issue persists.',
    });
  });

  it('returns the configured live site key', () => {
    expect(
      getTurnstileClientConfig({
        siteKey: '0x4AAAAAA-live-key',
        nodeEnv: 'production',
      })
    ).toEqual({
      siteKey: '0x4AAAAAA-live-key',
      mode: 'live',
      error: null,
    });
  });
});
