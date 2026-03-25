import { useState, useCallback } from 'react';
import { Pickaxe, HardHat, Zap, Loader2, ArrowUp } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { upgradeItem } from '@/lib/api';
import { toast } from 'sonner';

const DIG_TOOL_COSTS: Record<number, number> = {
  2: 50, 3: 150, 4: 400, 5: 1000, 6: 2500, 7: 5000, 8: 10000, 9: 20000, 10: 50000,
};
const MINING_RIG_COSTS: Record<number, number> = {
  2: 100, 3: 300, 4: 800, 5: 2000, 6: 5000, 7: 10000, 8: 20000, 9: 40000, 10: 80000,
};

interface UpgradeCardProps {
  title: string;
  icon: React.ReactNode;
  currentLevel: number;
  maxLevel: number;
  costs: Record<number, number>;
  balance: number;
  stat: string;
  onUpgrade: () => Promise<void>;
}

function UpgradeCard({ title, icon, currentLevel, maxLevel, costs, balance, stat, onUpgrade }: UpgradeCardProps) {
  const [loading, setLoading] = useState(false);
  const nextCost = costs[currentLevel + 1];
  const isMaxed = currentLevel >= maxLevel;
  const canAfford = nextCost ? balance >= nextCost : false;

  const handleUpgrade = async () => {
    if (loading || isMaxed || !canAfford) return;
    setLoading(true);
    try {
      await onUpgrade();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card-gradient rounded-2xl border border-border p-4 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-gold">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{stat}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          {Array.from({ length: maxLevel }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < currentLevel ? 'bg-gold' : 'bg-secondary'}`}
            />
          ))}
        </div>
        <span className="font-display text-xs text-gold">LVL {currentLevel}</span>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading || isMaxed || !canAfford}
        className={`w-full py-2.5 rounded-xl font-display text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2
          ${isMaxed ? 'bg-secondary text-muted-foreground' : canAfford ? 'bg-primary text-primary-foreground glow-gold' : 'bg-secondary text-muted-foreground opacity-60'}`}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
        {isMaxed ? 'MAX LEVEL' : `UPGRADE — ${nextCost} ADR`}
      </button>
    </div>
  );
}

export default function ShopPage() {
  const { user, loading, updateUser } = useUser();

  const handleUpgrade = useCallback(async (type: string) => {
    try {
      const data = await upgradeItem(type);
      updateUser(data.user);
      toast.success(`Upgraded! Cost: ${data.cost} ADR`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [updateUser]);

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
        <h1 className="text-lg font-display font-bold text-gold tracking-wider">SHOP</h1>
        <span className="text-xs font-display text-muted-foreground">{user.adr_balance.toFixed(2)} ADR</span>
      </div>

      <UpgradeCard
        title="Dig Tool"
        icon={<Pickaxe size={20} />}
        currentLevel={user.dig_tool_level}
        maxLevel={10}
        costs={DIG_TOOL_COSTS}
        balance={user.adr_balance}
        stat={`+${(1 + (user.dig_tool_level - 1) * 0.3).toFixed(1)}x dig reward`}
        onUpgrade={() => handleUpgrade('dig_tool')}
      />

      <UpgradeCard
        title="Mining Rig"
        icon={<HardHat size={20} />}
        currentLevel={user.mining_rig_level}
        maxLevel={10}
        costs={MINING_RIG_COSTS}
        balance={user.adr_balance}
        stat={`${user.mining_rig_level * 5} ADR/session`}
        onUpgrade={() => handleUpgrade('mining_rig')}
      />

      <UpgradeCard
        title="Energy Tank"
        icon={<Zap size={20} />}
        currentLevel={Math.floor((user.max_energy - 100) / 50) + 1}
        maxLevel={5}
        costs={{ 2: 200, 3: 500, 4: 1500, 5: 5000 }}
        balance={user.adr_balance}
        stat={`Max: ${user.max_energy} energy`}
        onUpgrade={() => handleUpgrade('energy')}
      />
    </div>
  );
}
