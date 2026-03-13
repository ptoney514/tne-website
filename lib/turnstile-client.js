export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

export function getTurnstileClientConfig({
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  nodeEnv = process.env.NODE_ENV,
} = {}) {
  const normalizedSiteKey = siteKey?.trim() || '';
  const isProduction = nodeEnv === 'production';

  if (!normalizedSiteKey) {
    if (isProduction) {
      return {
        siteKey: null,
        mode: 'missing',
        error: 'Security verification is temporarily unavailable. Please contact us if this issue persists.',
      };
    }

    return {
      siteKey: TURNSTILE_TEST_SITE_KEY,
      mode: 'test',
      error: null,
    };
  }

  if (isProduction && normalizedSiteKey === TURNSTILE_TEST_SITE_KEY) {
    return {
      siteKey: null,
      mode: 'invalid_test_key',
      error: 'Security verification is temporarily unavailable. Please contact us if this issue persists.',
    };
  }

  return {
    siteKey: normalizedSiteKey,
    mode: normalizedSiteKey === TURNSTILE_TEST_SITE_KEY ? 'test' : 'live',
    error: null,
  };
}
