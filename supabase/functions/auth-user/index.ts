import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate Telegram initData using HMAC-SHA256
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
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const secretHash = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken));

  const validationKey = await crypto.subtle.importKey(
    'raw',
    secretHash,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', validationKey, encoder.encode(dataCheckString));

  const computedHash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (computedHash !== hash) return null;

  const result: Record<string, string> = {};
  for (const [k, v] of params.entries()) {
    result[k] = v;
  }
  return result;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Dev mode: allow a specific dev_mode query param for browser testing
const DEV_MODE_ENABLED = Deno.env.get('DEV_MODE') === 'true';
const DEV_TELEGRAM_ID = 2139807311;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new Error('Bot token not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let telegramId: number;
    let telegramUser: any;

    // Validate initData
    const validated = await validateInitData(initData, botToken);

    if (validated) {
      telegramUser = JSON.parse(validated.user || '{}');
      telegramId = telegramUser.id;
    } else if (DEV_MODE_ENABLED && (!initData || initData === '')) {
      // Dev mode: skip Telegram validation, use admin account
      telegramId = DEV_TELEGRAM_ID;
      telegramUser = { id: DEV_TELEGRAM_ID, first_name: 'Dev', username: 'dev_admin' };
    } else {
      return new Response(JSON.stringify({ error: 'Invalid Telegram data' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!telegramId) {
      return new Response(JSON.stringify({ error: 'No user ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find or create user
    let { data: user, error: findErr } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (!user) {
      // Create new user
      const referralCode = generateReferralCode();
      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramId,
          username: telegramUser.username || null,
          first_name: telegramUser.first_name || null,
          last_name: telegramUser.last_name || null,
          referral_code: referralCode,
        })
        .select('*')
        .single();

      if (createErr) throw createErr;
      user = newUser;

      // Handle referral from start_param
      if (validated) {
        const startParam = validated.start_param;
        if (startParam?.startsWith('ref_')) {
          const refCode = startParam.replace('ref_', '');
          const { data: referrer } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', refCode)
            .single();

          if (referrer && referrer.id !== user.id) {
            await supabase.from('referrals').insert({
              referrer_id: referrer.id,
              referred_id: user.id,
            });
            await supabase
              .from('users')
              .update({ referred_by: referrer.id })
              .eq('id', user.id);
          }
        }
      }
    } else {
      // Update user info
      await supabase
        .from('users')
        .update({
          username: telegramUser.username || user.username,
          first_name: telegramUser.first_name || user.first_name,
          last_name: telegramUser.last_name || user.last_name,
        })
        .eq('id', user.id);
    }

    // Recalculate energy based on time
    const energyUpdated = new Date(user.energy_updated_at).getTime();
    const minutesPassed = Math.floor((Date.now() - energyUpdated) / 60000);
    if (minutesPassed > 0 && user.energy < user.max_energy) {
      const newEnergy = Math.min(user.energy + minutesPassed, user.max_energy);
      await supabase
        .from('users')
        .update({ energy: newEnergy, energy_updated_at: new Date().toISOString() })
        .eq('id', user.id);
      user.energy = newEnergy;
    }

    // Reset daily cap if new day
    const today = new Date().toISOString().split('T')[0];
    if (user.daily_earned_reset_at !== today) {
      await supabase
        .from('users')
        .update({ daily_earned_adr: 0, daily_earned_reset_at: today })
        .eq('id', user.id);
      user.daily_earned_adr = 0;
    }

    return new Response(JSON.stringify({ user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('auth-user error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
