import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

/**
 * Admin hook for managing practice schedules.
 * Provides CRUD operations for practice sessions and team assignments.
 */
export function usePracticeSchedulesAdmin() {
  const [practices, setPractices] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPractices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get('/admin/practice-sessions');

      // Sort by day of week order
      const dayOrder = {
        Monday: 1,
        monday: 1,
        Tuesday: 2,
        tuesday: 2,
        Wednesday: 3,
        wednesday: 3,
        Thursday: 4,
        thursday: 4,
        Friday: 5,
        friday: 5,
        Saturday: 6,
        saturday: 6,
        Sunday: 7,
        sunday: 7,
      };

      const sorted = (data || []).sort((a, b) => {
        const dayA = a.dayOfWeek || a.day_of_week || '';
        const dayB = b.dayOfWeek || b.day_of_week || '';
        const dayDiff = (dayOrder[dayA] || 8) - (dayOrder[dayB] || 8);
        if (dayDiff !== 0) return dayDiff;
        const startA = a.startTime || a.start_time || '';
        const startB = b.startTime || b.start_time || '';
        return startA.localeCompare(startB);
      });

      setPractices(sorted);
    } catch (err) {
      console.error('Error fetching practice schedules:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const data = await api.get('/admin/teams');
      // Filter to active teams only
      const activeTeams = (data || []).filter(t => t.isActive !== false && t.is_active !== false);
      setTeams(activeTeams);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }, []);

  useEffect(() => {
    fetchPractices();
    fetchTeams();
  }, [fetchPractices, fetchTeams]);

  /**
   * Create a new practice session
   */
  const createPractice = async (practiceData, teamIds = []) => {
    const data = await api.post('/admin/practice-sessions', {
      ...practiceData,
      teamIds,
    });
    await fetchPractices();
    return data;
  };

  /**
   * Update an existing practice session
   */
  const updatePractice = async (id, practiceData, teamIds = []) => {
    const data = await api.patch(`/admin/practice-sessions?id=${id}`, {
      ...practiceData,
      teamIds,
    });
    await fetchPractices();
    return data;
  };

  /**
   * Delete a practice session
   */
  const deletePractice = async (id) => {
    await api.delete(`/admin/practice-sessions?id=${id}`);
    await fetchPractices();
  };

  /**
   * Toggle practice active status
   */
  const toggleActive = async (id, isActive) => {
    await api.patch(`/admin/practice-sessions?id=${id}`, { isActive });
    await fetchPractices();
  };

  return {
    practices,
    teams,
    loading,
    error,
    refetch: fetchPractices,
    createPractice,
    updatePractice,
    deletePractice,
    toggleActive,
  };
}
