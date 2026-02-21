import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { api } from '@/lib/api-client';

// Mock api-client
vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useContactForm } from '@/hooks/useContactForm';

describe('useContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.post.mockResolvedValue({ success: true });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useContactForm());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(typeof result.current.submitInquiry).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  describe('email validation', () => {
    it('should reject invalid email format - missing @', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test User',
          email: 'invalidemail.com',
          subject: 'Test Subject',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.error).toBe('Please enter a valid email address');
      expect(result.current.success).toBe(false);
    });

    it('should reject invalid email format - missing domain extension', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test User',
          email: 'test@domain',
          subject: 'Test Subject',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.error).toBe('Please enter a valid email address');
    });

    it('should accept valid email format', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.error).toBe(null);
      expect(result.current.success).toBe(true);
    });

    it('should accept complex valid email formats', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test User',
          email: 'test.user+tag@subdomain.example.co.uk',
          subject: 'Test Subject',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.success).toBe(true);
    });
  });

  describe('required field validation', () => {
    it('should reject missing name', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: '',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.error).toBe('Please fill in all fields');
    });

    it('should reject missing email', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test User',
          email: '',
          subject: 'Test Subject',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.error).toBe('Please fill in all fields');
    });

    it('should reject missing subject', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test User',
          email: 'test@example.com',
          subject: '',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.error).toBe('Please fill in all fields');
    });

    it('should reject missing message', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: '',
        }, { skipMailto: true });
      });

      expect(result.current.error).toBe('Please fill in all fields');
    });
  });

  describe('name format handling', () => {
    it('should accept combined name field', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.success).toBe(true);
      expect(api.post).toHaveBeenCalledWith(
        '/public/contact',
        expect.objectContaining({ name: 'John Doe' })
      );
    });

    it('should combine firstName and lastName when name is not provided', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          subject: 'Test',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.success).toBe(true);
      expect(api.post).toHaveBeenCalledWith(
        '/public/contact',
        expect.objectContaining({ name: 'John Doe' })
      );
    });
  });

  describe('form submission', () => {
    it('should set loading state during submission', async () => {
      // Make post return a promise that doesn't resolve immediately
      let resolvePost;
      api.post.mockReturnValue(
        new Promise((resolve) => {
          resolvePost = resolve;
        })
      );

      const { result } = renderHook(() => useContactForm());

      // Start submission
      let submitPromise;
      act(() => {
        submitPromise = result.current.submitInquiry({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message',
        }, { skipMailto: true });
      });

      // Should be loading immediately
      expect(result.current.loading).toBe(true);

      // Resolve the post
      await act(async () => {
        resolvePost({ success: true });
        await submitPromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should return success result on successful submission', async () => {
      const { result } = renderHook(() => useContactForm());

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitInquiry({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(submitResult).toEqual({ success: true });
      expect(result.current.success).toBe(true);
    });

    it('should post correct data to API', async () => {
      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Team Inquiry',
          message: 'I have a question about tryouts',
        }, { skipMailto: true });
      });

      expect(api.post).toHaveBeenCalledWith('/public/contact', {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Team Inquiry',
        message: 'I have a question about tryouts',
      });
    });
  });

  describe('error handling', () => {
    it('should handle API error with skipMailto', async () => {
      api.post.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useContactForm());

      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(result.current.error).toBe('Failed to submit message. Please try again.');
      expect(result.current.success).toBe(false);
    });

    it('should return error result on failure', async () => {
      api.post.mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useContactForm());

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitInquiry({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test message',
        }, { skipMailto: true });
      });

      expect(submitResult).toEqual({
        success: false,
        error: 'Failed to submit message. Please try again.',
      });
    });
  });

  describe('reset function', () => {
    it('should reset all state', async () => {
      api.post.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useContactForm());

      // First, create an error state
      await act(async () => {
        await result.current.submitInquiry({
          name: 'Test',
          email: 'test@example.com',
          subject: 'Test',
          message: 'Test',
        }, { skipMailto: true });
      });

      expect(result.current.error).not.toBe(null);

      // Now reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.success).toBe(false);
    });
  });
});
