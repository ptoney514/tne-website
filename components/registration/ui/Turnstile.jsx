import { useEffect, useRef, useState, useCallback } from 'react';
import {
  getTurnstileClientConfig,
  TURNSTILE_TEST_SITE_KEY,
} from '@/lib/turnstile-client.js';

/**
 * Cloudflare Turnstile widget component
 *
 * Loads Turnstile script dynamically and renders the widget.
 * Returns token via onSuccess callback.
 *
 * Environment variables:
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY: Cloudflare Turnstile site key
 *
 * In local development and automated tests, fall back to Cloudflare's
 * public test key. Production must provide a real site key.
 * - Always fails: 2x00000000000000000000AB
 */

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

export default function Turnstile({ onSuccess, onError, onExpire, className = '' }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const turnstileConfig = getTurnstileClientConfig();
  const { siteKey, mode, error: configurationError } = turnstileConfig;
  const isUnconfigured = mode === 'unconfigured';
  const shouldBypassForAutomation = Boolean(
    siteKey === TURNSTILE_TEST_SITE_KEY
    && typeof navigator !== 'undefined'
    && navigator.webdriver
  );

  // Memoize error handler to use in script.onerror
  const handleLoadError = useCallback(() => {
    setLoadError(true);
    onError?.('Failed to load captcha script');
  }, [onError]);

  useEffect(() => {
    if (isUnconfigured) {
      onSuccess?.('turnstile-unconfigured');
      return undefined;
    }

    if (shouldBypassForAutomation) {
      setIsLoaded(true);
      setLoadError(false);
      onSuccess?.('automation-turnstile-token');
      return undefined;
    }

    if (!siteKey) {
      return undefined;
    }

    // Load Turnstile script if not already loaded
    if (window.turnstile) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already loading
    if (document.querySelector(`script[src="${TURNSTILE_SCRIPT_URL}"]`)) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.turnstile) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = handleLoadError;

    document.head.appendChild(script);
  }, [handleLoadError, isUnconfigured, onSuccess, shouldBypassForAutomation, siteKey]);

  useEffect(() => {
    if (isUnconfigured || shouldBypassForAutomation || !siteKey || !isLoaded || !containerRef.current || widgetIdRef.current) {
      return;
    }

    // Render the Turnstile widget
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'light',
      callback: (token) => {
        onSuccess?.(token);
      },
      'error-callback': (errorCode) => {
        onError?.(errorCode);
      },
      'expired-callback': () => {
        onExpire?.();
      },
    });

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore removal errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [isLoaded, onError, onExpire, onSuccess, shouldBypassForAutomation, siteKey]);

  if (isUnconfigured) {
    return null;
  }

  if (configurationError) {
    return (
      <div
        className={`text-sm text-red-700 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
        data-testid="turnstile-config-error"
      >
        {configurationError}
      </div>
    );
  }

  if (shouldBypassForAutomation) {
    return (
      <div className={`text-sm text-emerald-600 p-3 ${className}`} data-testid="turnstile-automation-bypass">
        Verification complete
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`text-sm text-red-600 p-3 bg-red-50 rounded-lg ${className}`}>
        Failed to load captcha
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`text-sm text-neutral-500 p-3 ${className}`}>
        Loading verification...
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
