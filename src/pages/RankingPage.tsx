import { Trophy, Medal, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/api';
import type { LeaderboardEntry } from '@/lib/types';

const RANK_COLORS = ['text-gold', 'text-foreground/70', 'text-orange-400'];
const RANK_ICONS = [
  <Trophy size={18} className="text-gold" />,
  <Medal size={18} className="text-foreground/70" />,
  <Medal size={18} className="text-orange-400" />,
];

export default function RankingPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((data) => setEntries(data.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-lg font-display font-bold text-gold tracking-wider">LEADERBOARD</h1>
        <p className="text-xs text-muted-foreground">Weekly top earners</p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-card-gradient rounded-xl border border-border p-8 text-center">
          <Trophy size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No rankings yet this week</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`bg-card-gradient rounded-xl border p-4 flex items-center gap-3 ${
                index < 3 ? 'border-primary/30 shadow-gold' : 'border-border'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                {index < 3 ? RANK_ICONS[index] : (
                  <span className="text-xs font-display font-bold text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${index < 3 ? RANK_COLORS[index] : ''}`}>
                  {entry.first_name || entry.username || 'Anonymous'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold text-gold">{Number(entry.earned_adr).toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground font-display">ADR</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
