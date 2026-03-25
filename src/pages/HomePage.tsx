import { useState, useCallback } from 'react';
import { Pickaxe, HandMetal, Calendar, Sparkles, ShoppingBag, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletCard } from '@/components/WalletCard';
import { EnergyBar } from '@/components/EnergyBar';
import { GameActionButton } from '@/components/GameActionButton';
import { StreakBadge } from '@/components/StreakBadge';
import { useUser } from '@/hooks/useUser';
import { performDig, performBeg, claimDaily } from '@/lib/api';
import { toast } from 'sonner';

export default function HomePage() {
  const { user, loading, updateUser } = useUser();
  const [lastResult, setLastResult] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDig = useCallback(async () => {
    try {
      const data = await performDig();
      updateUser(data.user);
      setLastResult(`⛏️ +${data.reward} ${data.currency}`);
      toast.success(`Dug up ${data.reward} ${data.currency}!`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [updateUser]);

  const handleBeg = useCallback(async () => {
    try {
      const data = await performBeg();
      updateUser(data.user);
      setLastResult(data.message);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [updateUser]);

  const handleDaily = useCallback(async () => {
    try {
      const data = await claimDaily();
      updateUser(data.user);
      setLastResult(`🎁 +${data.reward} ADR (${data.streak}x streak!)`);
      toast.success(`Daily bonus: +${data.reward} ADR!`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [updateUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-10 h-10 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-muted-foreground font-display text-sm tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center bg-card-gradient rounded-2xl border border-border p-8 shadow-card max-w-sm">
          <h1 className="text-xl font-display font-bold text-gold mb-2">AdsReward</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Open this app from Telegram to start earning!
          </p>
          <p className="text-xs text-muted-foreground">
            Launch via @Adsrewartsbot in Telegram
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-bold text-gold tracking-wider">AdsReward</h1>
          <p className="text-xs text-muted-foreground">
            Welcome, {user.first_name || user.username || 'Player'}
          </p>
        </div>
        <StreakBadge streak={user.daily_streak} />
      </div>

      {/* Energy */}
      <EnergyBar energy={user.energy} maxEnergy={user.max_energy} />

      {/* Wallet */}
      <WalletCard user={user} />

      {/* Last Result */}
      {lastResult && (
        <div className="bg-secondary/50 border border-primary/20 rounded-xl px-4 py-3 text-center">
          <p className="text-sm font-medium text-gold">{lastResult}</p>
        </div>
      )}

      {/* Game Actions */}
      <div className="grid grid-cols-2 gap-3">
        <GameActionButton
          label="DIG"
          icon={<Pickaxe size={18} />}
          onClick={handleDig}
          cooldownEnd={user.last_dig_at ? new Date(new Date(user.last_dig_at).getTime() + 30000).toISOString() : null}
          variant="gold"
        />
        <GameActionButton
          label="BEG"
          icon={<HandMetal size={18} />}
          onClick={handleBeg}
          cooldownEnd={user.last_beg_at ? new Date(new Date(user.last_beg_at).getTime() + 60000).toISOString() : null}
          variant="cyan"
        />
      </div>

      <GameActionButton
        label="CLAIM DAILY"
        icon={<Calendar size={18} />}
        onClick={handleDaily}
        cooldownEnd={user.last_daily_at ? new Date(new Date(user.last_daily_at).getTime() + 86400000).toISOString() : null}
        variant="emerald"
      />

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/shop')}
          className="bg-card-gradient rounded-xl border border-border p-4 shadow-card flex items-center gap-3 hover:border-primary/30 transition-colors"
        >
          <ShoppingBag size={20} className="text-primary" />
          <div className="text-left">
            <p className="text-xs font-display font-semibold text-foreground">SHOP</p>
            <p className="text-[10px] text-muted-foreground">Upgrades</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/chests')}
          className="bg-card-gradient rounded-xl border border-border p-4 shadow-card flex items-center gap-3 hover:border-primary/30 transition-colors"
        >
          <Box size={20} className="text-cyan" />
          <div className="text-left">
            <p className="text-xs font-display font-semibold text-foreground">CHESTS</p>
            <p className="text-[10px] text-muted-foreground">Lootboxes</p>
          </div>
        </button>
      </div>

      {/* Admin link - only for admin */}
      {user.telegram_id === 2139807311 && (
        <button
          onClick={() => navigate('/admin')}
          className="w-full bg-destructive/10 border border-destructive/20 rounded-xl py-2.5 text-xs font-display text-destructive tracking-wider hover:bg-destructive/20 transition-colors"
        >
          ⚙️ ADMIN PANEL
        </button>
      )}
    </div>
  );
}
