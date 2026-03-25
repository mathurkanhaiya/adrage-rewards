import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, initData } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    switch (type) {
      case 'leaderboard': {
        // Get current week start
        const now = new Date();
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const { data: entries } = await supabase
          .from('leaderboard')
          .select('*, users!inner(username, first_name)')
          .eq('period', 'weekly')
          .eq('period_start', weekStartStr)
          .order('earned_adr', { ascending: false })
          .limit(50);

        const mapped = (entries || []).map((e: any) => ({
          ...e,
          username: e.users?.username,
          first_name: e.users?.first_name,
        }));

        return new Response(JSON.stringify({ entries: mapped }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'tasks': {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        return new Response(JSON.stringify({ tasks: tasks || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'transactions': {
        // This requires initData validation in production
        return new Response(JSON.stringify({ transactions: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'missions': {
        const { data: missions } = await supabase
          .from('missions')
          .select('*')
          .eq('is_active', true);

        return new Response(JSON.stringify({ missions: missions || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'user_tasks': {
        // Validate initData to get user
        const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
        if (!botToken || !initData) {
          return new Response(JSON.stringify({ completedTaskIds: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        // Simple parse - get telegram user id from initData
        const params = new URLSearchParams(initData);
        const userStr = params.get('user');
        if (!userStr) {
          return new Response(JSON.stringify({ completedTaskIds: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const telegramUser = JSON.parse(userStr);
        const { data: dbUser } = await supabase.from('users').select('id').eq('telegram_id', telegramUser.id).single();
        if (!dbUser) {
          return new Response(JSON.stringify({ completedTaskIds: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const { data: userTasks } = await supabase.from('user_tasks').select('task_id').eq('user_id', dbUser.id);
        return new Response(JSON.stringify({ completedTaskIds: (userTasks || []).map((t: any) => t.task_id) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Unknown data type');
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
