import { Gift, Users, Share2, Copy, CheckCircle } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EarnPage() {
  const { user, loading } = useUser();
  const [copied, setCopied] = useState(false);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Gift className="w-10 h-10 text-primary animate-pulse" />
      </div>
    );
  }

  const referralLink = `https://t.me/Adsrewartsbot?start=ref_${user.referral_code}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareLink = () => {
    const text = `🎮 Join AdsReward and start earning crypto! Use my link:`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-20 px-4 pt-4 space-y-4 max-w-md mx-auto">
      <div>
        <h1 className="text-lg font-display font-bold text-gold tracking-wider">EARN</h1>
        <p className="text-xs text-muted-foreground">Invite friends & earn rewards</p>
      </div>

      {/* Referral Stats */}
      <div className="bg-card-gradient rounded-xl border border-border p-4 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-gold">{user.referral_count}</p>
            <p className="text-xs text-muted-foreground">Friends Invited</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-1">
          Earn <span className="text-gold font-semibold">50 ADR</span> for each active referral
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-card-gradient rounded-xl border border-border p-4 shadow-card space-y-3">
        <p className="text-xs font-display text-muted-foreground tracking-wider">YOUR REFERRAL LINK</p>
        <div className="bg-muted rounded-lg p-3 break-all">
          <p className="text-xs font-mono text-foreground/80">{referralLink}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 bg-secondary rounded-xl py-2.5 text-sm font-display tracking-wider text-foreground hover:bg-secondary/80 transition-colors"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
          <button
            onClick={shareLink}
            className="flex items-center justify-center gap-2 bg-primary rounded-xl py-2.5 text-sm font-display tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Share2 size={16} />
            SHARE
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-card-gradient rounded-xl border border-border p-4 shadow-card">
        <p className="text-xs font-display text-muted-foreground tracking-wider mb-3">HOW IT WORKS</p>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Share your referral link with friends' },
            { step: '2', text: 'They join via your link and start playing' },
            { step: '3', text: 'You earn 50 ADR once they become active' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-display font-bold text-primary">{item.step}</span>
              </div>
              <p className="text-sm text-foreground/80">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
