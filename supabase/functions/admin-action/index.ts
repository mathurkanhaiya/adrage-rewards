import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_TELEGRAM_ID = 2139807311;

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

async function verifyAdmin(initData: string, botToken: string) {
  const validated = await validateInitData(initData, botToken);
  if (!validated) throw new Error('Invalid Telegram data');
  const telegramUser = JSON.parse(validated.user || '{}');
  if (telegramUser.id !== ADMIN_TELEGRAM_ID) throw new Error('Unauthorized: admin access only');
  return telegramUser;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { action, initData, ...params } = await req.json();
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new Error('Bot token not configured');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await verifyAdmin(initData, botToken);

    let result: any;
    switch (action) {
      case 'stats': {
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const today = new Date().toISOString().split('T')[0];
        const { count: activeToday } = await supabase.from('users').select('*', { count: 'exact', head: true }).gte('updated_at', today);
        const { data: totalAdr } = await supabase.from('users').select('adr_balance');
        const circulatingAdr = totalAdr?.reduce((sum: number, u: any) => sum + Number(u.adr_balance), 0) || 0;
        const { count: pendingWithdrawals } = await supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        result = { totalUsers, activeToday, circulatingAdr: Math.round(circulatingAdr * 100) / 100, pendingWithdrawals };
        break;
      }
      case 'users': {
        const page = params.page || 0;
        const limit = 50;
        const { data: users, count } = await supabase.from('users').select('*', { count: 'exact' })
          .order('created_at', { ascending: false }).range(page * limit, (page + 1) * limit - 1);
        result = { users, total: count, page };
        break;
      }
      case 'ban_user': {
        const { error } = await supabase.from('users').update({ status: 'banned' }).eq('id', params.userId);
        if (error) throw error;
        await supabase.from('admin_logs').insert({ admin_user_id: params.userId, action: 'ban_user', target_user_id: params.userId });
        result = { success: true };
        break;
      }
      case 'unban_user': {
        const { error } = await supabase.from('users').update({ status: 'normal' }).eq('id', params.userId);
        if (error) throw error;
        result = { success: true };
        break;
      }
      case 'adjust_balance': {
        const { data: targetUser } = await supabase.from('users').select('*').eq('id', params.userId).single();
        if (!targetUser) throw new Error('User not found');
        const key = `${params.currency.toLowerCase()}_balance`;
        const before = Number(targetUser[key] || 0);
        const after = before + Number(params.amount);
        if (after < 0) throw new Error('Balance would go negative');
        await supabase.from('users').update({ [key]: after }).eq('id', params.userId);
        await supabase.from('transactions').insert({
          user_id: params.userId, type: 'admin_adjust', currency: params.currency,
          amount: Number(params.amount), balance_before: before, balance_after: after,
          metadata: { reason: params.reason || 'Admin adjustment' },
        });
        result = { success: true, before, after };
        break;
      }
      case 'withdrawals': {
        const { data: withdrawals } = await supabase.from('withdrawals').select('*, users!withdrawals_user_id_fkey(username, first_name, telegram_id)')
          .order('created_at', { ascending: false }).limit(100);
        result = { withdrawals };
        break;
      }
      case 'approve_withdrawal': {
        const { data: admin } = await supabase.from('users').select('id').eq('telegram_id', ADMIN_TELEGRAM_ID).single();
        await supabase.from('withdrawals').update({ status: 'approved', reviewed_by: admin?.id, reviewed_at: new Date().toISOString() }).eq('id', params.withdrawalId);
        result = { success: true };
        break;
      }
      case 'reject_withdrawal': {
        const { data: admin } = await supabase.from('users').select('id').eq('telegram_id', ADMIN_TELEGRAM_ID).single();
        const { data: withdrawal } = await supabase.from('withdrawals').select('*').eq('id', params.withdrawalId).single();
        if (!withdrawal) throw new Error('Withdrawal not found');
        // Refund
        const key = `${withdrawal.currency.toLowerCase()}_balance`;
        const { data: user } = await supabase.from('users').select(key).eq('id', withdrawal.user_id).single();
        await supabase.from('users').update({ [key]: Number(user[key]) + Number(withdrawal.amount) }).eq('id', withdrawal.user_id);
        await supabase.from('withdrawals').update({ status: 'rejected', reject_reason: params.reason || 'Rejected by admin', reviewed_by: admin?.id, reviewed_at: new Date().toISOString() }).eq('id', params.withdrawalId);
        result = { success: true };
        break;
      }
      case 'manage_tasks': {
        const { data: tasks } = await supabase.from('tasks').select('*').order('sort_order');
        result = { tasks };
        break;
      }
      case 'create_task': {
        const { error } = await supabase.from('tasks').insert({
          title: params.title, description: params.description || null,
          type: params.type || 'join_channel', url: params.url || null,
          channel_id: params.channelId || null,
          reward_amount: Number(params.rewardAmount) || 10,
          reward_currency: params.rewardCurrency || 'ADR',
        });
        if (error) throw error;
        result = { success: true };
        break;
      }
      case 'delete_task': {
        await supabase.from('tasks').update({ is_active: false }).eq('id', params.taskId);
        result = { success: true };
        break;
      }
      default:
        throw new Error('Unknown admin action');
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('admin-action error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
