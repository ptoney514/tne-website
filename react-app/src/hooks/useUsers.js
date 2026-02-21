import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api-client';

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
      const usersData = await api.get('/admin/users');
      setUsers(usersData || []);

      // Calculate stats
      const activeCount = (usersData || []).length;
      setStats((prev) => ({
        ...prev,
        total: activeCount,
        active: activeCount,
        deactivated: 0,
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
      const data = await api.get('/admin/invites');
      setInvites(data || []);
      setStats((prev) => ({
        ...prev,
        pending: (data || []).filter((i) => i.status === 'pending').length,
      }));
    } catch {
      setInvites([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchInvites();
  }, [fetchUsers, fetchInvites]);

  const updateUser = async (id, userData) => {
    const data = await api.patch(`/admin/users?id=${id}`, userData);
    await fetchUsers();
    return data;
  };

  const deactivateUser = async (id) => {
    // Would need to add support for deactivation in the API
    await api.patch(`/admin/users?id=${id}`, { is_active: false });
    await fetchUsers();
  };

  const reactivateUser = async (id) => {
    await api.patch(`/admin/users?id=${id}`, { is_active: true });
    await fetchUsers();
  };

  const createInvite = async (inviteData) => {
    const data = await api.post('/admin/invites', inviteData);
    await fetchInvites();
    return data;
  };

  const cancelInvite = async (id) => {
    await api.patch(`/admin/invites?id=${id}`, { status: 'revoked' });
    await fetchInvites();
  };

  const resendInvite = async (id) => {
    console.log('resendInvite not yet implemented', id);
    await fetchInvites();
  };

  const getUserById = async (id) => {
    const user = users.find((u) => u.id === id);
    return user || null;
  };

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
