import { supabase } from '@/integrations/supabase/client';

// Get Telegram WebApp initData for validation
function getInitData(): string {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData) {
    return (window as any).Telegram.WebApp.initData;
  }
  return '';
}

async function apiCall<T>(functionName: string, body?: Record<string, unknown>): Promise<T> {
  const initData = getInitData();
  
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: { ...body, initData },
  });

  if (error) throw new Error(error.message || 'API call failed');
  if (data?.error) throw new Error(data.error);
  return data as T;
}

// Auth / User
export const authUser = () => apiCall<{ user: import('./types').User }>('auth-user');

// Game Actions
export const performDig = () => apiCall<{ reward: number; currency: string; user: import('./types').User }>('game-action', { action: 'dig' });
export const performBeg = () => apiCall<{ reward: number; message: string; user: import('./types').User }>('game-action', { action: 'beg' });
export const claimDaily = () => apiCall<{ reward: number; streak: number; user: import('./types').User }>('game-action', { action: 'daily' });
export const startMining = () => apiCall<{ session: import('./types').MiningSession; user: import('./types').User }>('game-action', { action: 'start_mine' });
export const claimMining = () => apiCall<{ reward: number; user: import('./types').User }>('game-action', { action: 'claim_mine' });

// Read-only queries via edge function
export const getLeaderboard = () => apiCall<{ entries: import('./types').LeaderboardEntry[] }>('get-data', { type: 'leaderboard' });
export const getTasks = () => apiCall<{ tasks: import('./types').Task[] }>('get-data', { type: 'tasks' });
export const getTransactions = () => apiCall<{ transactions: import('./types').Transaction[] }>('get-data', { type: 'transactions' });
export const getMissions = () => apiCall<{ missions: import('./types').UserMission[] }>('get-data', { type: 'missions' });
