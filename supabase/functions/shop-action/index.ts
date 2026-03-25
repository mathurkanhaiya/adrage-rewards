import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  const { data: user, error } = await supabase.from('users').select('*').eq('telegram_id', telegramUser.id).single();
  if (error || !user) throw new Error('User not found');
  if (user.status === 'banned') throw new Error('Account suspended');
  return user;
}

// ============ UPGRADE COSTS ============
const DIG_TOOL_COSTS: Record<number, number> = {
  2: 50, 3: 150, 4: 400, 5: 1000, 6: 2500, 7: 5000, 8: 10000, 9: 20000, 10: 50000,
};
const MINING_RIG_COSTS: Record<number, number> = {
  2: 100, 3: 300, 4: 800, 5: 2000, 6: 5000, 7: 10000, 8: 20000, 9: 40000, 10: 80000,
};
const ENERGY_UPGRADE_COSTS: Record<number, { cost: number; maxEnergy: number }> = {
  1: { cost: 200, maxEnergy: 150 },
  2: { cost: 500, maxEnergy: 200 },
  3: { cost: 1500, maxEnergy: 300 },
  4: { cost: 5000, maxEnergy: 500 },
};

// ============ CHEST REWARDS ============
function generateChestReward(chestType: string): { currency: string; amount: number }[] {
  const rewards: { currency: string; amount: number }[] = [];
  if (chestType === 'free') {
    const roll = Math.random();
    if (roll < 0.6) {
      rewards.push({ currency: 'ADR', amount: Math.round((1 + Math.random() * 5) * 100) / 100 });
    } else if (roll < 0.9) {
      rewards.push({ currency: 'ADR', amount: Math.round((5 + Math.random() * 15) * 100) / 100 });
    } else {
      rewards.push({ currency: 'ADR', amount: Math.round((20 + Math.random() * 30) * 100) / 100 });
    }
  } else if (chestType === 'silver') {
    rewards.push({ currency: 'ADR', amount: Math.round((10 + Math.random() * 40) * 100) / 100 });
    if (Math.random() > 0.7) rewards.push({ currency: 'TRX', amount: Math.round((0.1 + Math.random() * 0.5) * 1000) / 1000 });
  } else if (chestType === 'gold') {
    rewards.push({ currency: 'ADR', amount: Math.round((50 + Math.random() * 150) * 100) / 100 });
    if (Math.random() > 0.5) rewards.push({ currency: 'DOGE', amount: Math.round((0.5 + Math.random() * 2) * 1000) / 1000 });
    if (Math.random() > 0.8) rewards.push({ currency: 'USDT', amount: Math.round((0.01 + Math.random() * 0.05) * 10000) / 10000 });
  }
  return rewards;
}

const CHEST_COSTS: Record<string, number> = { free: 0, silver: 50, gold: 200 };
const FREE_CHEST_COOLDOWN = 8 * 3600000; // 8 hours

async function handleUpgrade(supabase: any, user: any, upgradeType: string) {
  let cost = 0;
  let updateFields: Record<string, any> = {};

  if (upgradeType === 'dig_tool') {
    const nextLevel = user.dig_tool_level + 1;
    cost = DIG_TOOL_COSTS[nextLevel];
    if (!cost) throw new Error('Max level reached');
    if (user.adr_balance < cost) throw new Error(`Need ${cost} ADR to upgrade`);
    updateFields = { dig_tool_level: nextLevel, adr_balance: Number(user.adr_balance) - cost };
  } else if (upgradeType === 'mining_rig') {
    const nextLevel = user.mining_rig_level + 1;
    cost = MINING_RIG_COSTS[nextLevel];
    if (!cost) throw new Error('Max level reached');
    if (user.adr_balance < cost) throw new Error(`Need ${cost} ADR to upgrade`);
    updateFields = { mining_rig_level: nextLevel, adr_balance: Number(user.adr_balance) - cost };
  } else if (upgradeType === 'energy') {
    const currentTier = Math.floor((user.max_energy - 100) / 50);
    const upgrade = ENERGY_UPGRADE_COSTS[currentTier + 1];
    if (!upgrade) throw new Error('Max energy reached');
    cost = upgrade.cost;
    if (user.adr_balance < cost) throw new Error(`Need ${cost} ADR to upgrade`);
    updateFields = { max_energy: upgrade.maxEnergy, energy: Math.min(user.energy, upgrade.maxEnergy), adr_balance: Number(user.adr_balance) - cost };
  } else {
    throw new Error('Unknown upgrade type');
  }

  const balanceBefore = Number(user.adr_balance);
  const { error } = await supabase.from('users').update(updateFields).eq('id', user.id);
  if (error) throw error;

  await supabase.from('transactions').insert({
    user_id: user.id, type: 'boost_purchase', currency: 'ADR',
    amount: -cost, balance_before: balanceBefore, balance_after: balanceBefore - cost,
    metadata: { upgrade_type: upgradeType },
  });

  const { data: updatedUser } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { success: true, cost, user: updatedUser };
}

async function handleOpenChest(supabase: any, user: any, chestType: string) {
  const cost = CHEST_COSTS[chestType];
  if (cost === undefined) throw new Error('Unknown chest type');

  if (chestType === 'free') {
    const { data: lastFree } = await supabase.from('chests').select('opened_at')
      .eq('user_id', user.id).eq('chest_type', 'free')
      .order('opened_at', { ascending: false }).limit(1).single();
    if (lastFree) {
      const elapsed = Date.now() - new Date(lastFree.opened_at).getTime();
      if (elapsed < FREE_CHEST_COOLDOWN) throw new Error(`Free chest available in ${Math.ceil((FREE_CHEST_COOLDOWN - elapsed) / 3600000)}h`);
    }
  } else {
    if (user.adr_balance < cost) throw new Error(`Need ${cost} ADR`);
  }

  const rewards = generateChestReward(chestType);
  const balanceUpdates: Record<string, number> = {};
  const balanceBefore = Number(user.adr_balance);

  for (const r of rewards) {
    const key = `${r.currency.toLowerCase()}_balance`;
    balanceUpdates[key] = (Number(user[key]) || 0) + r.amount;
  }

  if (cost > 0) {
    balanceUpdates.adr_balance = (balanceUpdates.adr_balance ?? Number(user.adr_balance)) - cost;
  }

  const { error } = await supabase.from('users').update(balanceUpdates).eq('id', user.id);
  if (error) throw error;

  await supabase.from('chests').insert({ user_id: user.id, chest_type: chestType, rewards });

  for (const r of rewards) {
    await supabase.from('transactions').insert({
      user_id: user.id, type: 'chest_reward', currency: r.currency,
      amount: r.amount, balance_before: balanceBefore,
      balance_after: balanceUpdates.adr_balance ?? balanceBefore,
      metadata: { chest_type: chestType },
    });
  }

  const { data: updatedUser } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { rewards, cost, user: updatedUser };
}

async function handleClaimTask(supabase: any, user: any, taskId: string) {
  const { data: task, error: taskErr } = await supabase.from('tasks').select('*').eq('id', taskId).eq('is_active', true).single();
  if (taskErr || !task) throw new Error('Task not found');

  const { data: existing } = await supabase.from('user_tasks').select('id').eq('user_id', user.id).eq('task_id', taskId).single();
  if (existing) throw new Error('Task already completed');

  const balanceBefore = Number(user.adr_balance);
  const reward = Number(task.reward_amount);
  const key = `${task.reward_currency.toLowerCase()}_balance`;
  const balanceAfter = (Number(user[key]) || 0) + reward;

  await supabase.from('user_tasks').insert({ user_id: user.id, task_id: taskId });
  await supabase.from('users').update({ [key]: balanceAfter }).eq('id', user.id);
  await supabase.from('transactions').insert({
    user_id: user.id, type: 'task_reward', currency: task.reward_currency,
    amount: reward, balance_before: balanceBefore, balance_after: balanceAfter,
    metadata: { task_id: taskId, task_title: task.title },
  });

  const { data: updatedUser } = await supabase.from('users').select('*').eq('id', user.id).single();
  return { reward, currency: task.reward_currency, user: updatedUser };
}

async function handleGetShopData(_supabase: any, _user: any) {
  return {
    dig_tool_costs: DIG_TOOL_COSTS,
    mining_rig_costs: MINING_RIG_COSTS,
    energy_upgrade_costs: ENERGY_UPGRADE_COSTS,
    chest_costs: CHEST_COSTS,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { action, initData, ...params } = await req.json();
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new Error('Bot token not configured');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const user = await getUserFromInitData(supabase, initData, botToken);

    let result: any;
    switch (action) {
      case 'upgrade':
        result = await handleUpgrade(supabase, user, params.upgradeType);
        break;
      case 'open_chest':
        result = await handleOpenChest(supabase, user, params.chestType);
        break;
      case 'claim_task':
        result = await handleClaimTask(supabase, user, params.taskId);
        break;
      case 'shop_data':
        result = await handleGetShopData(supabase, user);
        break;
      default:
        throw new Error('Unknown action');
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('shop-action error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
