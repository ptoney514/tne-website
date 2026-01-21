import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    deactivated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all profiles (users)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('last_name', { ascending: true });

      if (usersError) throw usersError;

      // Fetch linked coach records
      const { data: coachesData, error: coachesError } = await supabase
        .from('coaches')
        .select('id, first_name, last_name, profile_id');

      if (coachesError) throw coachesError;

      // Fetch linked parent records
      const { data: parentsData, error: parentsError } = await supabase
        .from('parents')
        .select('id, first_name, last_name, profile_id');

      if (parentsError) throw parentsError;

      // Create lookup maps
      const coachByProfileId = {};
      coachesData?.forEach((coach) => {
        if (coach.profile_id) {
          coachByProfileId[coach.profile_id] = coach;
        }
      });

      const parentByProfileId = {};
      parentsData?.forEach((parent) => {
        if (parent.profile_id) {
          parentByProfileId[parent.profile_id] = parent;
        }
      });

      // Enrich users with linked profile data
      const enrichedUsers = usersData?.map((user) => ({
        ...user,
        linked_coach: coachByProfileId[user.id] || null,
        linked_parent: parentByProfileId[user.id] || null,
        // Default is_active to true if column doesn't exist yet
        is_active: user.is_active !== false,
      })) || [];

      setUsers(enrichedUsers);

      // Calculate stats
      const activeCount = enrichedUsers.filter((u) => u.is_active !== false).length;
      const deactivatedCount = enrichedUsers.filter((u) => u.is_active === false).length;

      setStats((prev) => ({
        ...prev,
        total: enrichedUsers.length,
        active: activeCount,
        deactivated: deactivatedCount,
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvites = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_invites')
        .select(`
          *,
          invited_by_profile:profiles!user_invites_invited_by_fkey(first_name, last_name)
        `)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (error) {
        // Table might not exist yet
        console.warn('Could not fetch invites:', error.message);
        setInvites([]);
        return;
      }

      setInvites(data || []);
      setStats((prev) => ({
        ...prev,
        pending: data?.length || 0,
      }));
    } catch (err) {
      console.warn('Error fetching invites:', err);
      setInvites([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchInvites();
  }, [fetchUsers, fetchInvites]);

  const updateUser = async (id, userData) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchUsers();
    return data;
  };

  const deactivateUser = async (id) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchUsers();
  };

  const reactivateUser = async (id) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchUsers();
  };

  const createInvite = async (inviteData) => {
    const { data, error } = await supabase
      .from('user_invites')
      .insert([inviteData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchInvites();
    return data;
  };

  const cancelInvite = async (id) => {
    const { error } = await supabase
      .from('user_invites')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      throw error;
    }

    await fetchInvites();
  };

  const resendInvite = async (id) => {
    // Reset expires_at to 7 days from now
    const { error } = await supabase
      .from('user_invites')
      .update({
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    // TODO: In future, trigger email resend via edge function
    await fetchInvites();
  };

  const getUserById = async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  // Refetch both users and invites
  const refetch = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchInvites()]);
  }, [fetchUsers, fetchInvites]);

  return {
    users,
    invites,
    stats,
    loading,
    error,
    refetch,
    updateUser,
    deactivateUser,
    reactivateUser,
    createInvite,
    cancelInvite,
    resendInvite,
    getUserById,
  };
}
