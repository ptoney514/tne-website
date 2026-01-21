import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'tne_config_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch tryout sessions
 *
 * Since tryout sessions are now managed via config.json,
 * this returns sessions based on whether tryouts are open.
 */
export function useTryoutSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        // Check localStorage cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            // If tryouts are open, we might have sessions in the future
            // For now, return empty array
            setSessions([]);
            setLoading(false);
            return;
          }
        }

        // Fetch config to check tryout status
        const response = await fetch('/data/json/config.json');
        if (!response.ok) {
          throw new Error('Failed to load config');
        }

        const config = await response.json();

        // Cache config
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: config, timestamp: Date.now() })
        );

        // Return empty sessions - when tryouts.is_open is true,
        // sessions would be defined in a separate tryouts.json file
        // For the simplified architecture, tryout registration will be
        // handled differently (e.g., Google Form or direct contact)
        setSessions([]);
      } catch (err) {
        console.error('Error loading tryout sessions:', err);
        setError(err.message);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  /**
   * Submit tryout registration
   *
   * For the simplified architecture, this opens email with registration details
   */
  const registerForTryout = useCallback(async (formData) => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Build email body
      const subject = encodeURIComponent(
        `[TNE Tryout Registration] ${formData.playerFirstName} ${formData.playerLastName}`
      );
      const body = encodeURIComponent(`
Tryout Registration Request

PLAYER INFORMATION
Name: ${formData.playerFirstName} ${formData.playerLastName}
Date of Birth: ${formData.playerDob}
Grade: ${formData.playerGrade}
Gender: ${formData.playerGender}
School: ${formData.playerSchool || 'Not provided'}

PARENT/GUARDIAN INFORMATION
Name: ${formData.parentFirstName} ${formData.parentLastName}
Email: ${formData.parentEmail}
Phone: ${formData.parentPhone}
Relationship: ${formData.relationship}
      `.trim());

      const mailtoUrl = `mailto:amitch2am@gmail.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;

      setSubmitSuccess(true);
      return { success: true };
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit registration');
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  }, []);

  const resetSubmitState = useCallback(() => {
    setSubmitSuccess(false);
    setSubmitError(null);
  }, []);

  return {
    sessions,
    loading,
    error,
    registerForTryout,
    submitting,
    submitSuccess,
    submitError,
    resetSubmitState,
  };
}
