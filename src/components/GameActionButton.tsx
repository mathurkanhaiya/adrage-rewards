import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => Promise<void>;
  disabled?: boolean;
  cooldownEnd?: string | null;
  variant?: 'gold' | 'cyan' | 'emerald';
}

function getCooldownRemaining(cooldownEnd: string | null): number {
  if (!cooldownEnd) return 0;
  const diff = new Date(cooldownEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 1000));
}

export function GameActionButton({ label, icon, onClick, disabled, cooldownEnd, variant = 'gold' }: GameActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const remaining = getCooldownRemaining(cooldownEnd ?? null);
  const isOnCooldown = remaining > 0;

  const handleClick = async () => {
    if (loading || isOnCooldown || disabled) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  const variantStyles = {
    gold: 'bg-primary text-primary-foreground hover:bg-primary/90 glow-gold',
    cyan: 'bg-accent text-accent-foreground hover:bg-accent/90 glow-cyan',
    emerald: 'bg-emerald text-primary-foreground hover:bg-emerald/90',
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || isOnCooldown || disabled}
      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display font-semibold text-sm tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]}`}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      {isOnCooldown ? `${remaining}s` : label}
    </button>
  );
}
