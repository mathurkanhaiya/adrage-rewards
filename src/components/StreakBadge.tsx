import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak <= 0) return null;
  
  return (
    <div className="inline-flex items-center gap-1 bg-destructive/20 border border-destructive/30 rounded-full px-2.5 py-0.5">
      <Flame size={12} className="text-destructive" />
      <span className="text-xs font-display font-semibold text-destructive">{streak}x</span>
    </div>
  );
}
