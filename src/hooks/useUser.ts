import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { authUser } from '@/lib/api';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authUser();
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  return { user, loading, error, refresh, updateUser };
}
