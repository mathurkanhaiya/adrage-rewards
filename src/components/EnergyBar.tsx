import { Zap } from 'lucide-react';

interface EnergyBarProps {
  energy: number;
  maxEnergy: number;
}

export function EnergyBar({ energy, maxEnergy }: EnergyBarProps) {
  const pct = Math.min((energy / maxEnergy) * 100, 100);
  
  return (
    <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1.5">
      <Zap size={14} className="text-primary" fill="currentColor" />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground">{energy}/{maxEnergy}</span>
    </div>
  );
}
