import { useState, useCallback } from 'react';
import { Gift, Loader2, Sparkles, Star } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { openChest } from '@/lib/api';
import { toast } from 'sonner';

const CHESTS = [
  { type: 'free', label: 'FREE CHEST', cost: 0, color: 'text-emerald', bg: 'bg-emerald', icon: Gift, cooldown: '8h cooldown' },
  { type: 'silver', label: 'SILVER CHEST', cost: 50, color: 'text-cyan', bg: 'bg-accent', icon: Star, cooldown: null },
  { type: 'gold', label: 'GOLD CHEST', cost: 200, color: 'text-gold', bg: 'bg-primary', icon: Sparkles, cooldown: null },
];

export default function ChestPage() {
  const { user, loading, updateUser } = useUser();
  const [openingType, setOpeningType] = useState<string | null>(null);
  const [lastRewards, setLastRewards] = useState<{ currency: string; amount: number }[] | null>(null);
  const [showReward, setShowReward] = useState(false);

  const handleOpen = useCallback(async (chestType: string) => {
    if (openingType) return;
    setOpeningType(chestType);
    try {
      const data = await openChest(chestType);
      updateUser(data.user);
      setLastRewards(data.rewards);
      setShowReward(true);
      toast.success('Chest opened!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setOpeningType(null);
    }
  }, [updateUser, openingType]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-display font-bold text-gold tracking-wider">CHESTS</h1>
        <span className="text-xs font-display text-muted-foreground">{user.adr_balance.toFixed(2)} ADR</span>
      </div>

      {/* Reward popup */}
      {showReward && lastRewards && (
        <div className="bg-card-gradient rounded-2xl border border-primary/30 p-6 text-center shadow-gold animate-float">
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-2" />
          <h3 className="font-display text-sm font-bold text-gold mb-3">REWARDS!</h3>
          {lastRewards.map((r, i) => (
            <p key={i} className="text-lg font-display font-bold text-foreground">
              +{r.amount} {r.currency}
            </p>
          ))}
          <button
            onClick={() => setShowReward(false)}
            className="mt-4 px-6 py-2 rounded-xl bg-secondary text-sm font-display text-foreground"
          >
            NICE!
          </button>
        </div>
      )}

      <div className="space-y-3">
        {CHESTS.map((chest) => {
          const Icon = chest.icon;
          const canAfford = chest.cost === 0 || user.adr_balance >= chest.cost;
          const isOpening = openingType === chest.type;

          return (
            <div key={chest.type} className="bg-card-gradient rounded-2xl border border-border p-4 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${chest.color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-sm font-bold text-foreground">{chest.label}</h3>
                  <p className="text-xs text-muted-foreground">
                    {chest.cost > 0 ? `${chest.cost} ADR` : 'Free'} {chest.cooldown && `• ${chest.cooldown}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpen(chest.type)}
                disabled={isOpening || !canAfford}
                className={`w-full py-3 rounded-xl font-display text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-40
                  ${chest.bg} text-primary-foreground`}
              >
                {isOpening ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
                {isOpening ? 'OPENING...' : 'OPEN'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
