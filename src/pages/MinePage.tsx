import { useState, useCallback, useEffect } from 'react';
import { Factory, Play, Clock, Gift } from 'lucide-react';
import { GameActionButton } from '@/components/GameActionButton';
import { useUser } from '@/hooks/useUser';
import { startMining, claimMining } from '@/lib/api';
import { toast } from 'sonner';

export default function MinePage() {
  const { user, loading, updateUser } = useUser();
  const [miningProgress, setMiningProgress] = useState(0);

  const isMining = user?.mining_until && new Date(user.mining_until) > new Date();
  const miningDone = user?.mining_until && new Date(user.mining_until) <= new Date();

  useEffect(() => {
    if (!isMining || !user?.mining_until || !user?.last_mine_start) return;
    
    const interval = setInterval(() => {
      const start = new Date(user.last_mine_start!).getTime();
      const end = new Date(user.mining_until!).getTime();
      const now = Date.now();
      const progress = Math.min(((now - start) / (end - start)) * 100, 100);
      setMiningProgress(progress);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMining, user?.mining_until, user?.last_mine_start]);

  const handleStartMining = useCallback(async () => {
    try {
      const data = await startMining();
      updateUser(data.user);
      toast.success('Mining started! Come back in 3 hours.');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [updateUser]);

  const handleClaimMining = useCallback(async () => {
    try {
      const data = await claimMining();
      updateUser(data.user);
      toast.success(`Claimed ${data.reward} ADR from mining!`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [updateUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Factory className="w-10 h-10 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  const timeRemaining = isMining && user.mining_until
    ? Math.max(0, Math.ceil((new Date(user.mining_until).getTime() - Date.now()) / 60000))
    : 0;

  return (
    <div className="pb-20 px-4 pt-4 space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-lg font-display font-bold text-gold tracking-wider">MINING</h1>
        <p className="text-xs text-muted-foreground">Passive ADR earning • Rig Level {user.mining_rig_level}</p>
      </div>

      {/* Mining Rig Visual */}
      <div className="bg-card-gradient rounded-2xl border border-border p-6 shadow-card text-center">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center ${isMining ? 'animate-pulse-glow' : ''}`}>
          <Factory size={40} className={isMining ? 'text-primary' : 'text-muted-foreground'} />
        </div>

        {isMining ? (
          <>
            <p className="text-sm font-display text-primary tracking-wider mb-2">MINING IN PROGRESS</p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${miningProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>{timeRemaining} min remaining</span>
            </div>
          </>
        ) : miningDone ? (
          <>
            <p className="text-sm font-display text-emerald tracking-wider mb-3">MINING COMPLETE!</p>
            <GameActionButton
              label="CLAIM REWARDS"
              icon={<Gift size={18} />}
              onClick={handleClaimMining}
              variant="emerald"
            />
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">Start a 3-hour mining session</p>
            <GameActionButton
              label="START MINING"
              icon={<Play size={18} />}
              onClick={handleStartMining}
              variant="gold"
            />
          </>
        )}
      </div>

      {/* Mining Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card-gradient rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground font-display tracking-wider">RIG LEVEL</p>
          <p className="text-2xl font-bold text-gold font-display">{user.mining_rig_level}</p>
        </div>
        <div className="bg-card-gradient rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground font-display tracking-wider">BASE RATE</p>
          <p className="text-2xl font-bold text-cyan font-display">{user.mining_rig_level * 5}</p>
          <p className="text-xs text-muted-foreground">ADR / session</p>
        </div>
      </div>
    </div>
  );
}
