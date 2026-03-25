
-- ========================================
-- AdsReward (ADR) Database Schema
-- ========================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TYPE public.transaction_type AS ENUM (
  'dig', 'mine', 'beg', 'daily_bonus', 'referral_reward', 
  'ad_reward', 'task_reward', 'chest_reward', 'stake_reward',
  'bet_win', 'bet_loss', 'bet_fee', 'withdraw', 'deposit',
  'boost_purchase', 'lottery_ticket', 'lottery_win',
  'mission_reward', 'admin_adjust', 'conversion'
);

CREATE TYPE public.user_status AS ENUM ('normal', 'suspicious', 'shadow_banned', 'banned');
CREATE TYPE public.withdraw_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.bet_status AS ENUM ('open', 'accepted', 'completed', 'cancelled', 'expired');

-- USERS TABLE
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  adr_balance NUMERIC(20, 4) NOT NULL DEFAULT 0 CHECK (adr_balance >= 0),
  ton_balance NUMERIC(20, 8) NOT NULL DEFAULT 0 CHECK (ton_balance >= 0),
  usdt_balance NUMERIC(20, 6) NOT NULL DEFAULT 0 CHECK (usdt_balance >= 0),
  trx_balance NUMERIC(20, 6) NOT NULL DEFAULT 0 CHECK (trx_balance >= 0),
  doge_balance NUMERIC(20, 8) NOT NULL DEFAULT 0 CHECK (doge_balance >= 0),
  energy INT NOT NULL DEFAULT 100,
  max_energy INT NOT NULL DEFAULT 100,
  energy_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  level INT NOT NULL DEFAULT 1,
  xp BIGINT NOT NULL DEFAULT 0,
  status public.user_status NOT NULL DEFAULT 'normal',
  daily_streak INT NOT NULL DEFAULT 0,
  last_daily_at TIMESTAMPTZ,
  last_dig_at TIMESTAMPTZ,
  last_beg_at TIMESTAMPTZ,
  last_mine_start TIMESTAMPTZ,
  mining_until TIMESTAMPTZ,
  referred_by UUID REFERENCES public.users(id),
  referral_code TEXT UNIQUE,
  referral_count INT NOT NULL DEFAULT 0,
  dig_tool_level INT NOT NULL DEFAULT 1,
  mining_rig_level INT NOT NULL DEFAULT 1,
  daily_earned_adr NUMERIC(20, 4) NOT NULL DEFAULT 0,
  daily_earned_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  ip_address TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_users_status ON public.users(status);

-- USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- TRANSACTIONS TABLE
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ADR',
  amount NUMERIC(20, 8) NOT NULL,
  balance_before NUMERIC(20, 8),
  balance_after NUMERIC(20, 8),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- REFERRALS TABLE
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_given BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);

-- MINING SESSIONS TABLE
CREATE TABLE public.mining_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT false,
  reward_amount NUMERIC(20, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mining_sessions_user ON public.mining_sessions(user_id);

-- TASKS TABLE
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'join_channel',
  reward_amount NUMERIC(20, 4) NOT NULL DEFAULT 0,
  reward_currency TEXT NOT NULL DEFAULT 'ADR',
  url TEXT,
  channel_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USER TASKS
CREATE TABLE public.user_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- WITHDRAWALS TABLE
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  wallet_address TEXT NOT NULL,
  status public.withdraw_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  reject_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_withdrawals_user ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);

-- BETS TABLE
CREATE TABLE public.bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  game_type TEXT NOT NULL,
  amount NUMERIC(20, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ADR',
  status public.bet_status NOT NULL DEFAULT 'open',
  creator_result INT,
  opponent_result INT,
  winner_id UUID REFERENCES public.users(id),
  house_fee NUMERIC(20, 4) NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_bets_creator ON public.bets(creator_id);
CREATE INDEX idx_bets_status ON public.bets(status);

-- CHESTS TABLE
CREATE TABLE public.chests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chest_type TEXT NOT NULL DEFAULT 'free',
  rewards JSONB NOT NULL DEFAULT '{}',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STAKING TABLE
CREATE TABLE public.staking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(20, 4) NOT NULL,
  apy_rate NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lock_until TIMESTAMPTZ NOT NULL,
  last_claim_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_staking_user ON public.staking(user_id);

-- BOOSTS TABLE
CREATE TABLE public.boosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL,
  multiplier NUMERIC(5, 2) NOT NULL DEFAULT 2.0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boosts_user ON public.boosts(user_id);

-- MISSIONS TABLE
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'daily',
  requirement_type TEXT NOT NULL,
  requirement_value INT NOT NULL DEFAULT 1,
  reward_amount NUMERIC(20, 4) NOT NULL,
  reward_currency TEXT NOT NULL DEFAULT 'ADR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USER MISSIONS
CREATE TABLE public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, mission_id, reset_at)
);

-- LOTTERY TABLES
CREATE TABLE public.lottery_draws (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date DATE NOT NULL UNIQUE,
  jackpot NUMERIC(20, 4) NOT NULL DEFAULT 0,
  winning_number INT,
  winner_id UUID REFERENCES public.users(id),
  is_drawn BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.lottery_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES public.lottery_draws(id) ON DELETE CASCADE,
  ticket_number INT NOT NULL,
  cost NUMERIC(20, 4) NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LEADERBOARD
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL DEFAULT 'weekly',
  earned_adr NUMERIC(20, 4) NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  UNIQUE(user_id, period, period_start)
);

CREATE INDEX idx_leaderboard_period ON public.leaderboard(period, period_start, earned_adr DESC);

-- GAME CONFIG TABLE
CREATE TABLE public.game_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.game_config (key, value) VALUES
  ('dig_cooldown_seconds', '30'),
  ('beg_cooldown_seconds', '60'),
  ('mining_duration_hours', '3'),
  ('daily_adr_cap', '500'),
  ('adr_to_usdt_rate', '0.0001'),
  ('house_fee_percent', '5'),
  ('min_withdraw_usdt', '1'),
  ('daily_withdraw_limit_usdt', '50'),
  ('referral_reward_adr', '50'),
  ('energy_refill_rate_per_min', '1'),
  ('dig_energy_cost', '5'),
  ('beg_energy_cost', '3');

-- ADMIN LOGS
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.users(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER FUNCTION
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- PUBLIC READ POLICIES
CREATE POLICY "Anyone can read game config" ON public.game_config FOR SELECT USING (true);
CREATE POLICY "Anyone can read active tasks" ON public.tasks FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can read active missions" ON public.missions FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can read lottery draws" ON public.lottery_draws FOR SELECT USING (true);
CREATE POLICY "Anyone can read leaderboard" ON public.leaderboard FOR SELECT USING (true);

-- UPDATE TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
