import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
      // Fetch all practice sessions with their assigned teams
      const { data, error: fetchError } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          practice_session_teams(
            id,
            team:teams(id, name, grade_level, tier)
          ),
          season:seasons(id, name, is_active)
        `)
        .order('day_of_week', { ascending: true });

      if (fetchError) throw fetchError;

      // Sort by day of week order
      const dayOrder = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 7,
      };

      const sorted = (data || []).sort((a, b) => {
        const dayDiff = dayOrder[a.day_of_week] - dayOrder[b.day_of_week];
        if (dayDiff !== 0) return dayDiff;
        return a.start_time.localeCompare(b.start_time);
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
    // Fetch active teams for assignment dropdown
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, grade_level, tier, season:seasons!inner(is_active)')
      .eq('is_active', true)
      .eq('seasons.is_active', true)
      .order('grade_level', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }
    setTeams(data || []);
  }, []);

  useEffect(() => {
    fetchPractices();
    fetchTeams();
  }, [fetchPractices, fetchTeams]);

  /**
   * Create a new practice session
   */
  const createPractice = async (practiceData, teamIds = []) => {
    // Get active season
    const { data: activeSeason } = await supabase
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single();

    if (!activeSeason) {
      throw new Error('No active season found');
    }

    // Create practice session
    const { data: practice, error: practiceError } = await supabase
      .from('practice_sessions')
      .insert({
        ...practiceData,
        season_id: activeSeason.id,
      })
      .select()
      .single();

    if (practiceError) throw practiceError;

    // Assign teams if provided
    if (teamIds.length > 0) {
      const assignments = teamIds.map((teamId) => ({
        practice_session_id: practice.id,
        team_id: teamId,
      }));

      const { error: assignError } = await supabase
        .from('practice_session_teams')
        .insert(assignments);

      if (assignError) throw assignError;
    }

    await fetchPractices();
    return practice;
  };

  /**
   * Update an existing practice session
   */
  const updatePractice = async (id, practiceData, teamIds = []) => {
    // Update practice session
    const { data: practice, error: practiceError } = await supabase
      .from('practice_sessions')
      .update(practiceData)
      .eq('id', id)
      .select()
      .single();

    if (practiceError) throw practiceError;

    // Update team assignments - delete existing and re-add
    await supabase
      .from('practice_session_teams')
      .delete()
      .eq('practice_session_id', id);

    if (teamIds.length > 0) {
      const assignments = teamIds.map((teamId) => ({
        practice_session_id: id,
        team_id: teamId,
      }));

      const { error: assignError } = await supabase
        .from('practice_session_teams')
        .insert(assignments);

      if (assignError) throw assignError;
    }

    await fetchPractices();
    return practice;
  };

  /**
   * Delete a practice session
   */
  const deletePractice = async (id) => {
    // Cascade will handle practice_session_teams
    const { error } = await supabase
      .from('practice_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await fetchPractices();
  };

  /**
   * Toggle practice active status
   */
  const toggleActive = async (id, isActive) => {
    const { error } = await supabase
      .from('practice_sessions')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;

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
