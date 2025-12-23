import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitInquiry = useCallback(
    async ({ firstName, lastName, email, phone, subject, message }) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const { error: insertError } = await supabase
          .from('contact_inquiries')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email,
            phone: phone || null,
            subject,
            message,
            status: 'new',
          });

        if (insertError) throw insertError;

        setSuccess(true);
        return { success: true };
      } catch (err) {
        console.error('Error submitting contact inquiry:', err);
        setError(err.message || 'Failed to submit inquiry');
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
