import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Same initData validation as auth-user
async function validateInitData(initData: string, botToken: string): Promise<Record<string, string> | null> {
  if (!initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const entries = Array.from(params.entries());
  entries.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey('raw', encoder.encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const secretHash = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken));
  const validationKey = await crypto.subtle.importKey('raw', secretHash, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', validationKey, encoder.encode(dataCheckString));
  const computedHash = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
  if (computedHash !== hash) return null;
  const result: Record<string, string> = {};
  for (const [k, v] of params.entries()) result[k] = v;
  return result;
}

async function getUserFromInitData(supabase: any, initData: string, botToken: string) {
  const validated = await validateInitData(initData, botToken);
  if (!validated) throw new Error('Invalid Telegram data');
  const telegramUser = JSON.parse(validated.user || '{}');
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramUser.id)
    .single();
  if (error || !user) throw new Error('User not found. Open the app first.');
  if (user.status === 'banned') throw new Error('Account suspended');
  return user;
}

async function logTransaction(supabase: any, userId: string, type: string, currency: string, amount: number, balanceBefore: number, balanceAfter: number, metadata: Record<string, unknown> = {}) {
  await supabase.from('transactions').insert({
    user_id: userId,
    type,
    currency,
    amount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    metadata,
  });
}

// ============ GAME ACTIONS ============

async function handleDig(supabase: any, user: any) {
  // Check cooldown (30s)
  if (user.last_dig_at) {
    const elapsed = Date.now() - new Date(user.last_dig_at).getTime();
    if (elapsed < 30000) throw new Error(`Wait ${Math.ceil((30000 - elapsed) / 1000)}s to dig again`);
  }
  // Check energy
  if (user.energy < 5) throw new Error('Not enough energy! Wait for refill or watch an ad.');
  // Check daily cap
  if (user.daily_earned_adr >= 500) throw new Error('Daily earning cap reached');

  // Calculate reward based on tool level
  const baseReward = 1 + Math.random() * 3;
  const toolMultiplier = 1 + (user.dig_tool_level - 1) * 0.3;
  const reward = Math.round(baseReward * toolMultiplier * 100) / 100;

  const balanceBefore = Number(user.adr_balance);
  const balanceAfter = balanceBefore + reward;

  const { error } = await supabase
    .from('users')
    .update({
      adr_balance: balanceAfter,
      energy: user.energy - 5,
      last_dig_at: new Date().toISOString(),
      daily_earned_adr: Number(user.daily_earned_adr) + reward,
    })
    .eq('id', user.id);

  if (error) throw error;

  await logTransaction(supabase, user.id, 'dig', 'ADR', reward, balanceBefore, balanceAfter);

  const { data: updatedUser } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { reward, currency: 'ADR', user: updatedUser };
}

async function handleBeg(supabase: any, user: any) {
  // Check cooldown (60s)
  if (user.last_beg_at) {
    const elapsed = Date.now() - new Date(user.last_beg_at).getTime();
    if (elapsed < 60000) throw new Error(`Wait ${Math.ceil((60000 - elapsed) / 1000)}s to beg again`);
  }
  if (user.energy < 3) throw new Error('Not enough energy!');

  const roll = Math.random();
  let reward = 0;
  let message = '';

  if (roll < 0.3) {
    // Fail
    message = '😢 Nobody gave you anything...';
  } else if (roll < 0.85) {
    // Small reward
    reward = Math.round((0.5 + Math.random() * 2) * 100) / 100;
    message = `🙏 Someone felt generous! +${reward} ADR`;
  } else {
    // Big reward
    reward = Math.round((3 + Math.random() * 7) * 100) / 100;
    message = `🎉 A whale was feeling generous! +${reward} ADR`;
  }

  const balanceBefore = Number(user.adr_balance);
  const balanceAfter = balanceBefore + reward;

  const { error } = await supabase
    .from('users')
    .update({
      adr_balance: balanceAfter,
      energy: user.energy - 3,
      last_beg_at: new Date().toISOString(),
      daily_earned_adr: Number(user.daily_earned_adr) + reward,
    })
    .eq('id', user.id);

  if (error) throw error;

  if (reward > 0) {
    await logTransaction(supabase, user.id, 'beg', 'ADR', reward, balanceBefore, balanceAfter);
  }

  const { data: updatedUser } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { reward, message, user: updatedUser };
}

async function handleDaily(supabase: any, user: any) {
  // Check 24h cooldown
  if (user.last_daily_at) {
    const elapsed = Date.now() - new Date(user.last_daily_at).getTime();
    if (elapsed < 86400000) throw new Error(`Daily bonus already claimed. Come back in ${Math.ceil((86400000 - elapsed) / 3600000)}h`);
  }

  // Calculate streak
  let newStreak = 1;
  if (user.last_daily_at) {
    const hoursSince = (Date.now() - new Date(user.last_daily_at).getTime()) / 3600000;
    if (hoursSince < 48) {
      newStreak = user.daily_streak + 1;
    }
  }

  // Reward with streak multiplier
  const baseReward = 10;
  const streakBonus = Math.min(newStreak, 7); // cap at 7x
  const reward = baseReward * streakBonus;

  const balanceBefore = Number(user.adr_balance);
  const balanceAfter = balanceBefore + reward;

  const { error } = await supabase
    .from('users')
    .update({
      adr_balance: balanceAfter,
      daily_streak: newStreak,
      last_daily_at: new Date().toISOString(),
      daily_earned_adr: Number(user.daily_earned_adr) + reward,
    })
    .eq('id', user.id);

  if (error) throw error;

  await logTransaction(supabase, user.id, 'daily_bonus', 'ADR', reward, balanceBefore, balanceAfter, { streak: newStreak });

  const { data: updatedUser } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { reward, streak: newStreak, user: updatedUser };
}

async function handleStartMine(supabase: any, user: any) {
  // Check if already mining
  if (user.mining_until && new Date(user.mining_until) > new Date()) {
    throw new Error('Mining already in progress!');
  }

  const durationHours = 3;
  const endsAt = new Date(Date.now() + durationHours * 3600000).toISOString();

  const { error } = await supabase
    .from('users')
    .update({
      last_mine_start: new Date().toISOString(),
      mining_until: endsAt,
    })
    .eq('id', user.id);

  if (error) throw error;

  const { data: session, error: sessErr } = await supabase
    .from('mining_sessions')
    .insert({
      user_id: user.id,
      ends_at: endsAt,
    })
    .select('*')
    .single();

  if (sessErr) throw sessErr;

  const { data: updatedUser } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { session, user: updatedUser };
}

async function handleClaimMine(supabase: any, user: any) {
  if (!user.mining_until) throw new Error('No mining session found');
  if (new Date(user.mining_until) > new Date()) throw new Error('Mining not finished yet');

  // Find unclaimed session
  const { data: session } = await supabase
    .from('mining_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('claimed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!session) throw new Error('No unclaimed mining session');

  const baseReward = 5 * user.mining_rig_level;
  const reward = Math.round((baseReward + Math.random() * baseReward * 0.5) * 100) / 100;

  const balanceBefore = Number(user.adr_balance);
  const balanceAfter = balanceBefore + reward;

  // Update user and session
  await supabase
    .from('mining_sessions')
    .update({ claimed: true, reward_amount: reward })
    .eq('id', session.id);

  const { error } = await supabase
    .from('users')
    .update({
      adr_balance: balanceAfter,
      mining_until: null,
      last_mine_start: null,
      daily_earned_adr: Number(user.daily_earned_adr) + reward,
    })
    .eq('id', user.id);

  if (error) throw error;

  await logTransaction(supabase, user.id, 'mine', 'ADR', reward, balanceBefore, balanceAfter, { rig_level: user.mining_rig_level });

  const { data: updatedUser } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { reward, user: updatedUser };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, initData } = await req.json();
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new Error('Bot token not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const user = await getUserFromInitData(supabase, initData, botToken);

    let result: any;
    switch (action) {
      case 'dig':
        result = await handleDig(supabase, user);
        break;
      case 'beg':
        result = await handleBeg(supabase, user);
        break;
      case 'daily':
        result = await handleDaily(supabase, user);
        break;
      case 'start_mine':
        result = await handleStartMine(supabase, user);
        break;
      case 'claim_mine':
        result = await handleClaimMine(supabase, user);
        break;
      default:
        throw new Error('Unknown action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('game-action error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
