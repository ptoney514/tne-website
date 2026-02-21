/**
 * Cloudflare Turnstile verification helper
 *
 * Env vars required:
 * - TURNSTILE_SECRET_KEY: Cloudflare Turnstile secret key
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify a Turnstile token
 *
 * @param {string} token - The Turnstile token from the client
 * @param {string} remoteIP - Optional remote IP address
 * @returns {Object} - { success: boolean, error?: string }
 */
export async function verifyTurnstile(token, remoteIP = null) {
  try {
    // Check for secret key
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      // In development without Turnstile configured, allow bypass
      if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
        console.warn('[Turnstile] Secret key not configured, bypassing verification');
        return { success: true };
      }
      throw new Error('TURNSTILE_SECRET_KEY environment variable not set');
    }

    // If no token provided, fail verification
    if (!token) {
      return {
        success: false,
        error: 'No Turnstile token provided',
      };
    }

    // Build form data for verification
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIP) {
      formData.append('remoteip', remoteIP);
    }

    // Verify with Cloudflare
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Turnstile API returned ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return { success: true };
    }

    // Return error codes if verification failed
    const errorCodes = result['error-codes'] || [];
    return {
      success: false,
      error: `Turnstile verification failed: ${errorCodes.join(', ') || 'unknown error'}`,
    };
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if Turnstile is configured
 * @returns {boolean}
 */
export function isConfigured() {
  return !!process.env.TURNSTILE_SECRET_KEY;
}
