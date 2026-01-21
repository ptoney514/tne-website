import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Cloudflare Turnstile widget component
 *
 * Loads Turnstile script dynamically and renders the widget.
 * Returns token via onSuccess callback.
 *
 * Environment variables:
 * - VITE_TURNSTILE_SITE_KEY: Cloudflare Turnstile site key
 *
 * For development, use Cloudflare's test keys:
 * - Always passes: 1x00000000000000000000AA
 * - Always fails: 2x00000000000000000000AB
 */

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

export default function Turnstile({ onSuccess, onError, onExpire, className = '' }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Get site key from environment or use test key
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  // Memoize error handler to use in script.onerror
  const handleLoadError = useCallback(() => {
    setLoadError(true);
    onError?.('Failed to load captcha script');
  }, [onError]);

  useEffect(() => {
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
  }, [handleLoadError]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || widgetIdRef.current) {
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
  }, [isLoaded, siteKey, onSuccess, onError, onExpire]);

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
