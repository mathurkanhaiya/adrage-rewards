import { useState, useCallback } from 'react';
import { Wallet, ArrowUpRight, Loader2, CheckCircle } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { CURRENCY_CONFIG, type CurrencyKey } from '@/lib/constants';

const WITHDRAW_CURRENCIES: { key: CurrencyKey; minAmount: number }[] = [
  { key: 'ADR', minAmount: 100 },
  { key: 'TON', minAmount: 0.1 },
  { key: 'USDT', minAmount: 1 },
  { key: 'TRX', minAmount: 10 },
  { key: 'DOGE', minAmount: 10 },
];

export default function WithdrawPage() {
  const { user, loading, updateUser } = useUser();
  const [currency, setCurrency] = useState<CurrencyKey>('ADR');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedConfig = WITHDRAW_CURRENCIES.find((c) => c.key === currency)!;
  const balanceKey = `${currency.toLowerCase()}_balance` as keyof typeof user;
  const balance = user ? Number((user as any)[balanceKey] || 0) : 0;

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt < selectedConfig.minAmount) return toast.error(`Minimum withdrawal: ${selectedConfig.minAmount} ${currency}`);
    if (amt > balance) return toast.error('Insufficient balance');
    if (!wallet.trim()) return toast.error('Enter wallet address');

    setSubmitting(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      // We call the shop-action edge function for withdrawal
      const { data, error } = await supabase.functions.invoke('shop-action', {
        body: {
          action: 'withdraw',
          initData: (window as any).Telegram?.WebApp?.initData || '',
          currency,
          amount: amt,
          walletAddress: wallet.trim(),
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.user) updateUser(data.user);
      setSuccess(true);
      setAmount('');
      setWallet('');
      toast.success('Withdrawal request submitted!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [user, amount, wallet, currency, balance, selectedConfig, updateUser]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-lg font-display font-bold text-gold tracking-wider">WITHDRAW</h1>
        <p className="text-xs text-muted-foreground">Request a withdrawal to your wallet</p>
      </div>

      {success && (
        <div className="bg-emerald/10 border border-emerald/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-emerald w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Request submitted!</p>
            <p className="text-xs text-muted-foreground">Admin will review your withdrawal. You'll be notified.</p>
          </div>
        </div>
      )}

      {/* Currency Select */}
      <div className="bg-card-gradient rounded-xl border border-border p-4 shadow-card space-y-3">
        <p className="text-xs font-display text-muted-foreground tracking-wider">SELECT CURRENCY</p>
        <div className="grid grid-cols-5 gap-1.5">
          {WITHDRAW_CURRENCIES.map((c) => (
            <button
              key={c.key}
              onClick={() => { setCurrency(c.key); setAmount(''); setSuccess(false); }}
              className={`py-2 rounded-lg text-[10px] font-display font-semibold tracking-wider transition-all ${
                currency === c.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {c.key}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
          <span className="text-xs text-muted-foreground">Balance</span>
          <span className="text-sm font-mono font-bold text-gold">
            {balance.toFixed(CURRENCY_CONFIG[currency].decimals)} {currency}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-card-gradient rounded-xl border border-border p-4 shadow-card space-y-3">
        <p className="text-xs font-display text-muted-foreground tracking-wider">AMOUNT</p>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setSuccess(false); }}
            placeholder={`Min: ${selectedConfig.minAmount}`}
            className="w-full bg-secondary text-foreground rounded-lg px-3 py-3 text-sm font-mono pr-16 outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => setAmount(String(balance))}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-display font-semibold"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-card-gradient rounded-xl border border-border p-4 shadow-card space-y-3">
        <p className="text-xs font-display text-muted-foreground tracking-wider">WALLET ADDRESS</p>
        <input
          type="text"
          value={wallet}
          onChange={(e) => { setWallet(e.target.value); setSuccess(false); }}
          placeholder="Enter your wallet address"
          className="w-full bg-secondary text-foreground rounded-lg px-3 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !amount || !wallet}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display text-sm font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ArrowUpRight size={16} />
            WITHDRAW {currency}
          </>
        )}
      </button>

      {/* Info */}
      <div className="bg-card-gradient rounded-xl border border-border p-4 shadow-card">
        <p className="text-xs font-display text-muted-foreground tracking-wider mb-2">INFO</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>• Withdrawals are reviewed by admin within 24h</li>
          <li>• Minimum: {selectedConfig.minAmount} {currency}</li>
          <li>• Rejected withdrawals are automatically refunded</li>
        </ul>
      </div>
    </div>
  );
}
