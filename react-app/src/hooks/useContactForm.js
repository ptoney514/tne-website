import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Contact form hook with Supabase storage
 *
 * Saves contact submissions to Supabase database and optionally
 * opens a mailto link as a secondary notification.
 */
export function useContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitInquiry = useCallback(async (data, options = {}) => {
    const { skipMailto = false } = options;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Handle both name formats (combined name or firstName/lastName)
      const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();

      // Validate required fields
      if (!name || !data.email || !data.subject || !data.message) {
        throw new Error('Please fill in all fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Save to Supabase
      const { error: insertError } = await supabase
        .from('contact_submissions')
        .insert({
          name: name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          status: 'new',
        });

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        // Don't fail completely if Supabase fails - still allow mailto
        if (!skipMailto) {
          console.warn('Falling back to mailto only');
        } else {
          throw new Error('Failed to submit message. Please try again.');
        }
      }

      // Open mailto as secondary notification (skip in tests)
      if (!skipMailto) {
        const recipient = 'amitch2am@gmail.com';
        const subject = encodeURIComponent(`[TNE Website] ${data.subject}: ${name}`);
        const body = encodeURIComponent(
          `From: ${name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\n${data.message}`
        );

        const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

        // Open email client
        window.location.href = mailtoUrl;
      }

      setSuccess(true);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      return { success: false, error: errorMessage };
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
