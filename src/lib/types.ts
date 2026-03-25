export interface User {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  adr_balance: number;
  ton_balance: number;
  usdt_balance: number;
  trx_balance: number;
  doge_balance: number;
  energy: number;
  max_energy: number;
  energy_updated_at: string;
  level: number;
  xp: number;
  status: 'normal' | 'suspicious' | 'shadow_banned' | 'banned';
  daily_streak: number;
  last_daily_at: string | null;
  last_dig_at: string | null;
  last_beg_at: string | null;
  last_mine_start: string | null;
  mining_until: string | null;
  referral_code: string;
  referral_count: number;
  dig_tool_level: number;
  mining_rig_level: number;
  daily_earned_adr: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  currency: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  type: string;
  reward_amount: number;
  reward_currency: string;
  url: string | null;
  channel_id: string | null;
  is_active: boolean;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string | null;
  first_name: string | null;
  earned_adr: number;
  period: string;
  period_start: string;
}

export interface MiningSession {
  id: string;
  started_at: string;
  ends_at: string;
  claimed: boolean;
  reward_amount: number | null;
}

export interface Mission {
  id: string;
  title: string;
  description: string | null;
  type: string;
  requirement_type: string;
  requirement_value: number;
  reward_amount: number;
  reward_currency: string;
}

export interface UserMission {
  id: string;
  mission_id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  mission?: Mission;
}
