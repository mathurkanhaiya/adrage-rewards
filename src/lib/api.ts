import { supabase } from '@/integrations/supabase/client';

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

// Shop / Upgrades
export const upgradeItem = (upgradeType: string) => apiCall<{ success: boolean; cost: number; user: import('./types').User }>('shop-action', { action: 'upgrade', upgradeType });
export const openChest = (chestType: string) => apiCall<{ rewards: { currency: string; amount: number }[]; cost: number; user: import('./types').User }>('shop-action', { action: 'open_chest', chestType });
export const claimTask = (taskId: string) => apiCall<{ reward: number; currency: string; user: import('./types').User }>('shop-action', { action: 'claim_task', taskId });
export const getShopData = () => apiCall<{ dig_tool_costs: Record<number, number>; mining_rig_costs: Record<number, number>; chest_costs: Record<string, number> }>('shop-action', { action: 'shop_data' });

// Read-only queries
export const getLeaderboard = () => apiCall<{ entries: import('./types').LeaderboardEntry[] }>('get-data', { type: 'leaderboard' });
export const getTasks = () => apiCall<{ tasks: import('./types').Task[] }>('get-data', { type: 'tasks' });
export const getTransactions = () => apiCall<{ transactions: import('./types').Transaction[] }>('get-data', { type: 'transactions' });
export const getMissions = () => apiCall<{ missions: import('./types').UserMission[] }>('get-data', { type: 'missions' });
export const getUserTasks = () => apiCall<{ completedTaskIds: string[] }>('get-data', { type: 'user_tasks' });

// Admin
export const adminStats = () => apiCall<{ totalUsers: number; activeToday: number; circulatingAdr: number; pendingWithdrawals: number }>('admin-action', { action: 'stats' });
export const adminUsers = (page?: number) => apiCall<{ users: import('./types').User[]; total: number }>('admin-action', { action: 'users', page });
export const adminBanUser = (userId: string) => apiCall<{ success: boolean }>('admin-action', { action: 'ban_user', userId });
export const adminUnbanUser = (userId: string) => apiCall<{ success: boolean }>('admin-action', { action: 'unban_user', userId });
export const adminAdjustBalance = (userId: string, currency: string, amount: number, reason: string) => apiCall<{ success: boolean }>('admin-action', { action: 'adjust_balance', userId, currency, amount, reason });
export const adminWithdrawals = () => apiCall<{ withdrawals: any[] }>('admin-action', { action: 'withdrawals' });
export const adminApproveWithdrawal = (withdrawalId: string) => apiCall<{ success: boolean }>('admin-action', { action: 'approve_withdrawal', withdrawalId });
export const adminRejectWithdrawal = (withdrawalId: string, reason: string) => apiCall<{ success: boolean }>('admin-action', { action: 'reject_withdrawal', withdrawalId, reason });
export const adminManageTasks = () => apiCall<{ tasks: import('./types').Task[] }>('admin-action', { action: 'manage_tasks' });
export const adminCreateTask = (task: { title: string; description?: string; type?: string; url?: string; channelId?: string; rewardAmount?: number; rewardCurrency?: string }) => apiCall<{ success: boolean }>('admin-action', { action: 'create_task', ...task });
export const adminDeleteTask = (taskId: string) => apiCall<{ success: boolean }>('admin-action', { action: 'delete_task', taskId });
