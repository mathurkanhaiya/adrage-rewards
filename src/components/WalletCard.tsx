import { CURRENCY_CONFIG, type CurrencyKey } from '@/lib/constants';
import type { User } from '@/lib/types';

interface WalletCardProps {
  user: User;
}

const BALANCE_KEYS: Record<CurrencyKey, keyof User> = {
  ADR: 'adr_balance',
  TON: 'ton_balance',
  USDT: 'usdt_balance',
  TRX: 'trx_balance',
  DOGE: 'doge_balance',
};

export function WalletCard({ user }: WalletCardProps) {
  const adrRate = 0.0001; // configurable
  const totalUsdt =
    user.adr_balance * adrRate + user.usdt_balance + user.ton_balance * 3.5 + user.trx_balance * 0.12 + user.doge_balance * 0.08;

  return (
    <div className="bg-card-gradient rounded-xl border border-border p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground font-display tracking-wider">TOTAL BALANCE</p>
          <p className="text-2xl font-bold text-gold font-display">
            ~${totalUsdt.toFixed(2)} <span className="text-sm text-muted-foreground">USDT</span>
          </p>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
          <span className="text-xs text-primary font-display">LVL {user.level}</span>
        </div>
      </div>

      <div className="space-y-2">
        {(Object.keys(CURRENCY_CONFIG) as CurrencyKey[]).map((key) => {
          const config = CURRENCY_CONFIG[key];
          const balance = Number(user[BALANCE_KEYS[key]]);
          return (
            <div key={key} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                <img src={config.icon} alt={config.name} className="w-5 h-5 rounded-full" />
                <span className="text-sm font-medium">{config.name}</span>
              </div>
              <span className="text-sm font-mono text-foreground">
                {balance.toFixed(config.decimals)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
