import { useState, useCallback } from 'react';

/**
 * Simple contact form hook
 *
 * Since we don't have a backend to store contact messages,
 * this opens a mailto link with the message contents.
 */
export function useContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitInquiry = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!data.name || !data.email || !data.subject || !data.message) {
        throw new Error('Please fill in all fields');
      }

      // Build mailto URL
      const recipient = 'amitch2am@gmail.com';
      const subject = encodeURIComponent(`[TNE Website] ${data.subject}: ${data.name}`);
      const body = encodeURIComponent(
        `From: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\n${data.message}`
      );

      const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

      // Open email client
      window.location.href = mailtoUrl;

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submitInquiry,
    loading,
    error,
    success,
    reset,
  };
}
