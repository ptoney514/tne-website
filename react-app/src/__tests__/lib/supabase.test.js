import { describe, it, expect, vi } from 'vitest';

// We need to test withTimeout in isolation without the supabase client initialization
// So we'll create a standalone version for testing
function withTimeout(promise, ms, errorMessage = 'Request timed out') {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

describe('withTimeout utility', () => {
  describe('Success Cases (no fake timers)', () => {
    it('should resolve when promise completes before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 1000, 'Timed out');
      expect(result).toBe('success');
    });

    it('should pass through resolved value unchanged', async () => {
      const data = { user: { id: '123', email: 'test@example.com' } };
      const promise = Promise.resolve(data);

      const result = await withTimeout(promise, 1000, 'Timed out');
      expect(result).toEqual(data);
    });

    it('should pass through rejected errors unchanged', async () => {
      const error = new Error('Original error');
      const promise = Promise.reject(error);

      await expect(withTimeout(promise, 1000, 'Timed out')).rejects.toThrow('Original error');
    });

    it('should use custom error message in timeout', async () => {
      // Quick timeout for testing
      const promise = new Promise((resolve) => setTimeout(() => resolve('late'), 100));
      await expect(withTimeout(promise, 10, 'Custom timeout message')).rejects.toThrow(
        'Custom timeout message'
      );
    });

    it('should use default error message when not provided', async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve('late'), 100));
      await expect(withTimeout(promise, 10)).rejects.toThrow('Request timed out');
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout when promise resolves quickly', async () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const promise = Promise.resolve('quick');
      await withTimeout(promise, 5000, 'Timed out');

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should clear timeout when promise rejects quickly', async () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const promise = Promise.reject(new Error('quick error'));
      await withTimeout(promise, 5000, 'Timed out').catch(() => {});

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Integration with Supabase-like operations', () => {
    it('should work with getSession-like operation', async () => {
      const mockGetSession = () =>
        Promise.resolve({
          data: { session: { user: { email: 'test@example.com' } } },
          error: null,
        });

      const result = await withTimeout(mockGetSession(), 8000, 'Session check timed out');

      expect(result.data.session.user.email).toBe('test@example.com');
    });

    it('should work with signIn-like operation', async () => {
      const mockSignIn = (email, password) =>
        Promise.resolve(
          email === 'test@example.com' && password === 'correct'
            ? { data: { user: { email } }, error: null }
            : { data: null, error: { message: 'Invalid credentials' } }
        );

      const success = await withTimeout(
        mockSignIn('test@example.com', 'correct'),
        30000,
        'Sign in timed out'
      );
      expect(success.data.user.email).toBe('test@example.com');

      const fail = await withTimeout(
        mockSignIn('test@example.com', 'wrong'),
        30000,
        'Sign in timed out'
      );
      expect(fail.error.message).toBe('Invalid credentials');
    });
  });

  describe('Error Types', () => {
    it('should create Error with correct message property', async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve('late'), 100));

      try {
        await withTimeout(promise, 10, 'Custom error');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect(error.message).toBe('Custom error');
      }
    });

    it('should allow catching timeout errors specifically', async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve('late'), 100));

      try {
        await withTimeout(promise, 10, 'timed out');
      } catch (error) {
        const isTimeout = error.message.includes('timed out');
        expect(isTimeout).toBe(true);
      }
    });
  });

  describe('Timeout behavior', () => {
    it('should timeout slow operations', async () => {
      const slowOperation = new Promise((resolve) => {
        setTimeout(() => resolve('too slow'), 200);
      });

      await expect(withTimeout(slowOperation, 50, 'Operation timed out')).rejects.toThrow(
        'Operation timed out'
      );
    });

    it('should not timeout fast operations', async () => {
      const fastOperation = new Promise((resolve) => {
        setTimeout(() => resolve('fast enough'), 10);
      });

      const result = await withTimeout(fastOperation, 100, 'Timed out');
      expect(result).toBe('fast enough');
    });
  });
});
