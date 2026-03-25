import { useState, useEffect, useCallback } from 'react';
import { Shield, Users, Wallet, ListTodo, Loader2, Ban, Check, X, Plus } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import {
  adminStats, adminUsers, adminBanUser, adminUnbanUser,
  adminWithdrawals, adminApproveWithdrawal, adminRejectWithdrawal,
  adminManageTasks, adminCreateTask, adminDeleteTask,
} from '@/lib/api';
import { toast } from 'sonner';

type Tab = 'stats' | 'users' | 'withdrawals' | 'tasks';

export default function AdminPage() {
  const { user, loading } = useUser();
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', url: '', rewardAmount: '10', type: 'join_channel' });

  const isAdmin = user?.telegram_id === 2139807311;

  const loadTab = useCallback(async (t: Tab) => {
    setLoadingData(true);
    try {
      switch (t) {
        case 'stats': {
          const data = await adminStats();
          setStats(data);
          break;
        }
        case 'users': {
          const data = await adminUsers(0);
          setUsers(data.users || []);
          break;
        }
        case 'withdrawals': {
          const data = await adminWithdrawals();
          setWithdrawals(data.withdrawals || []);
          break;
        }
        case 'tasks': {
          const data = await adminManageTasks();
          setTasks(data.tasks || []);
          break;
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadTab(tab);
  }, [tab, isAdmin, loadTab]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center bg-card-gradient rounded-2xl border border-destructive/30 p-8">
          <Shield className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground">Admin access only</p>
        </div>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'stats', label: 'Stats', icon: <Shield size={14} /> },
    { key: 'users', label: 'Users', icon: <Users size={14} /> },
    { key: 'withdrawals', label: 'Withdrawals', icon: <Wallet size={14} /> },
    { key: 'tasks', label: 'Tasks', icon: <ListTodo size={14} /> },
  ];

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-lg font-display font-bold text-gold tracking-wider">ADMIN</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg font-display text-[10px] font-semibold tracking-wider transition-all
              ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loadingData ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : (
        <>
          {/* Stats */}
          {tab === 'stats' && stats && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'Active Today', value: stats.activeToday },
                { label: 'Circulating ADR', value: stats.circulatingAdr?.toFixed(0) },
                { label: 'Pending Withdrawals', value: stats.pendingWithdrawals },
              ].map((s) => (
                <div key={s.label} className="bg-card-gradient rounded-xl border border-border p-4 text-center">
                  <p className="text-xl font-display font-bold text-gold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-2">
              {users.map((u: any) => (
                <div key={u.id} className="bg-card-gradient rounded-xl border border-border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.first_name || u.username || 'Anon'}</p>
                    <p className="text-[10px] text-muted-foreground">ID: {u.telegram_id} • {u.adr_balance.toFixed(0)} ADR • {u.status}</p>
                  </div>
                  {u.status === 'banned' ? (
                    <button onClick={async () => { await adminUnbanUser(u.id); loadTab('users'); toast.success('Unbanned'); }}
                      className="px-2 py-1 rounded bg-emerald text-primary-foreground text-[10px] font-display">
                      UNBAN
                    </button>
                  ) : (
                    <button onClick={async () => { await adminBanUser(u.id); loadTab('users'); toast.success('Banned'); }}
                      className="px-2 py-1 rounded bg-destructive text-destructive-foreground text-[10px] font-display">
                      <Ban size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Withdrawals */}
          {tab === 'withdrawals' && (
            <div className="space-y-2">
              {withdrawals.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No withdrawals</p>}
              {withdrawals.map((w: any) => (
                <div key={w.id} className="bg-card-gradient rounded-xl border border-border p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{w.amount} {w.currency}</span>
                    <span className={`text-[10px] font-display px-2 py-0.5 rounded ${w.status === 'pending' ? 'bg-gold text-primary-foreground' : w.status === 'approved' ? 'bg-emerald text-primary-foreground' : 'bg-destructive text-destructive-foreground'}`}>
                      {w.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{w.wallet_address}</p>
                  {w.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={async () => { await adminApproveWithdrawal(w.id); loadTab('withdrawals'); toast.success('Approved'); }}
                        className="flex-1 py-1.5 rounded bg-emerald text-primary-foreground text-[10px] font-display flex items-center justify-center gap-1">
                        <Check size={12} /> APPROVE
                      </button>
                      <button onClick={async () => { await adminRejectWithdrawal(w.id, 'Rejected'); loadTab('withdrawals'); toast.success('Rejected & refunded'); }}
                        className="flex-1 py-1.5 rounded bg-destructive text-destructive-foreground text-[10px] font-display flex items-center justify-center gap-1">
                        <X size={12} /> REJECT
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tasks */}
          {tab === 'tasks' && (
            <div className="space-y-2">
              <button onClick={() => setShowCreateTask(!showCreateTask)}
                className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-display text-xs flex items-center justify-center gap-1">
                <Plus size={14} /> CREATE TASK
              </button>
              {showCreateTask && (
                <div className="bg-card-gradient rounded-xl border border-border p-4 space-y-2">
                  <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title" className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm" />
                  <input value={newTask.url} onChange={(e) => setNewTask({ ...newTask, url: e.target.value })}
                    placeholder="URL (optional)" className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm" />
                  <input value={newTask.rewardAmount} onChange={(e) => setNewTask({ ...newTask, rewardAmount: e.target.value })}
                    placeholder="Reward" type="number" className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm" />
                  <button onClick={async () => {
                    await adminCreateTask({ title: newTask.title, url: newTask.url, rewardAmount: Number(newTask.rewardAmount) });
                    setShowCreateTask(false);
                    setNewTask({ title: '', description: '', url: '', rewardAmount: '10', type: 'join_channel' });
                    loadTab('tasks');
                    toast.success('Task created');
                  }} className="w-full py-2 rounded-lg bg-emerald text-primary-foreground font-display text-xs">SAVE</button>
                </div>
              )}
              {tasks.map((t: any) => (
                <div key={t.id} className="bg-card-gradient rounded-xl border border-border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">{t.reward_amount} {t.reward_currency} • {t.is_active ? 'Active' : 'Disabled'}</p>
                  </div>
                  {t.is_active && (
                    <button onClick={async () => { await adminDeleteTask(t.id); loadTab('tasks'); toast.success('Disabled'); }}
                      className="px-2 py-1 rounded bg-destructive text-destructive-foreground text-[10px] font-display">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
