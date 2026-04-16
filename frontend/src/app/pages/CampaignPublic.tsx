import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import { TrendingUp, Users, DollarSign, Zap, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface PublicCampaign {
  campaign_id: string;
  creator_id: string;
  term_months: number;
  revenue_share_pct: number;
  target_amount: number;
  raised_amount: number;
  investor_count: number;
  return_base: number;
  return_low: number;
  return_high: number;
  start_date: string | null;
  creator_name?: string;
  creator_handle?: string;
  creator_thumbnail?: string;
  ai_score?: number;
}

export function CampaignPublic() {
  const { palette } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invest state
  const [amount, setAmount] = useState(100);
  const [investing, setInvesting] = useState(false);
  const [invested, setInvested] = useState(false);
  const [investError, setInvestError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setError('Invalid campaign link.'); setLoading(false); return; }
    callApi<PublicCampaign>('getPublicCampaign_CampaignPublic', { pathParams: { campaign_id: id } })
      .then(res => { setCampaign(res.data); setLoading(false); })
      .catch(() => { setError('Campaign not found or no longer active.'); setLoading(false); });
  }, [id]);

  const handleInvest = async () => {
    if (!user) {
      sessionStorage.setItem('fanfolio_post_login_redirect', `/campaign/${id}`);
      navigate('/login');
      return;
    }
    if (!campaign) return;
    if (invested) { navigate('/portfolio'); return; }

    setInvesting(true);
    setInvestError(null);
    try {
      await callApi('investInCampaign_CreatorPage', {
        pathParams: { campaign_id: campaign.campaign_id },
        payload: { fan_email: user.email, fan_name: user.name ?? user.email, amount },
      });
      setInvested(true);
      // Update local raised_amount and investor_count optimistically
      setCampaign(prev => prev ? {
        ...prev,
        raised_amount: prev.raised_amount + amount,
        investor_count: prev.investor_count + 1,
      } : prev);
      setTimeout(() => navigate('/portfolio'), 1500);
    } catch {
      setInvestError('Backing failed — please try again.');
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: palette.bg }}>
        <Loader2 size={32} className="animate-spin" style={{ color: palette.primary }} />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center" style={{ backgroundColor: palette.bg }}>
        <p className="text-5xl font-black" style={{ color: palette.primary, opacity: 0.3 }}>404</p>
        <p className="font-bold text-lg" style={{ color: palette.text }}>Campaign not found</p>
        <p className="text-sm" style={{ color: palette.textMuted }}>{error}</p>
        <button onClick={() => navigate('/marketplace')} className="text-sm underline" style={{ color: palette.primary }}>
          Browse other campaigns
        </button>
      </div>
    );
  }

  const creatorName = campaign.creator_name ?? 'Creator';
  const creatorHandle = campaign.creator_handle ?? '';
  const thumbnail = campaign.creator_thumbnail ?? '';
  const aiScore = campaign.ai_score ?? 0;

  const pctRaised = campaign.target_amount > 0
    ? Math.min(100, Math.round((campaign.raised_amount / campaign.target_amount) * 100))
    : 0;

  const fmtReturn = (n: number) => n > 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;
  const returnColor = (n: number) => n > 0 ? palette.success : n < 0 ? palette.danger : palette.textMuted;

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-lg mx-auto px-5 py-10">

        {/* Header badge */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
          >
            <Zap size={12} /> Creator Backing Campaign
          </div>
        </div>

        {/* Creator card */}
        <div
          className="rounded-2xl p-6 mb-5 text-center"
          style={{ background: palette.gradient }}
        >
          {thumbnail && (
            <img
              src={thumbnail}
              alt={creatorName}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl mx-auto mb-3 object-cover"
              style={{ border: `3px solid ${palette.onPrimary}30` }}
            />
          )}
          <h1 className="text-2xl font-black mb-0.5" style={{ color: palette.onPrimary }}>{creatorName}</h1>
          {creatorHandle && <p className="text-sm mb-3" style={{ color: `${palette.onPrimary}bb` }}>{creatorHandle}</p>}
          {aiScore > 0 && (
            <div
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold"
              style={{ backgroundColor: `${palette.onPrimary}20`, color: palette.onPrimary }}
            >
              AI Score {aiScore}/100
            </div>
          )}
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: Users,      label: 'Backers',     value: `${campaign.investor_count ?? 0}`,          color: palette.primary },
            { icon: DollarSign, label: 'Raised',      value: `$${(campaign.raised_amount ?? 0).toLocaleString()}`, color: palette.accent },
            { icon: TrendingUp, label: 'Upside',      value: fmtReturn(campaign.return_high ?? 0),       color: palette.success },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
                <Icon size={16} className="mx-auto mb-1" style={{ color: item.color }} />
                <p className="font-black text-sm" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs" style={{ color: palette.textSubtle }}>{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Campaign details */}
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
          <h3 className="font-bold mb-4" style={{ color: palette.text }}>Campaign Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Campaign Term',    value: `${campaign.term_months} months` },
              { label: 'Revenue Share',    value: `${campaign.revenue_share_pct}% of AdSense income` },
              { label: 'Raise Target',     value: `$${(campaign.target_amount ?? 0).toLocaleString()}` },
              { label: 'Start Date',       value: campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'TBD' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span style={{ color: palette.textMuted }}>{item.label}</span>
                <span className="font-semibold" style={{ color: palette.text }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Raise progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: palette.textMuted }}>Raised</span>
              <span style={{ color: palette.text }}>{pctRaised}% of target</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pctRaised}%`, background: palette.gradient }} />
            </div>
          </div>
        </div>

        {/* Return scenarios */}
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
          <h3 className="font-bold mb-1" style={{ color: palette.text }}>Expected Return Range</h3>
          <p className="text-xs mb-4" style={{ color: palette.textMuted }}>
            Based on creator's AI forecast. Your payout = your backing share × actual YouTube revenue.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Conservative', value: campaign.return_low ?? 0 },
              { label: 'Base',         value: campaign.return_base ?? 0 },
              { label: 'Optimistic',   value: campaign.return_high ?? 0 },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
                <p className="font-black text-sm" style={{ color: returnColor(s.value) }}>{fmtReturn(s.value)}</p>
                <p className="text-xs" style={{ color: palette.textSubtle }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
          <h3 className="font-bold mb-3" style={{ color: palette.text }}>How It Works</h3>
          {[
            { step: '1', text: `Back ${creatorName}'s campaign to join the backing pool.` },
            { step: '2', text: `Every month, ${campaign.revenue_share_pct}% of actual YouTube revenue is tracked.` },
            { step: '3', text: 'Your payout = (your backing / total backed) × revenue share × actual revenue.' },
          ].map(item => (
            <div key={item.step} className="flex gap-3 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: `${palette.primary}20`, color: palette.primary }}
              >
                {item.step}
              </div>
              <p className="text-sm" style={{ color: palette.textMuted }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Invest panel */}
        {user ? (
          <div className="rounded-2xl p-5 mb-2" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <h3 className="font-bold mb-4" style={{ color: palette.text }}>Simulate Your Backing</h3>

            {/* Amount input */}
            <div className="mb-3">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: palette.textMuted }}>Backing Amount</label>
              <div className="relative mb-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: palette.textMuted }}>$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Math.max(10, Math.min(10000, Number(e.target.value))))}
                  disabled={invested}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-bold outline-none"
                  style={{ backgroundColor: palette.surfaceAlt, color: palette.text, border: `1px solid ${palette.border}` }}
                />
              </div>
              <input
                type="range" min={10} max={10000} step={10}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                disabled={invested}
                className="w-full"
                style={{ accentColor: palette.primary }}
              />
            </div>

            {/* Return preview */}
            {campaign && (
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                {[
                  { label: 'Conservative', pct: campaign.return_low ?? 0 },
                  { label: 'Base',         pct: campaign.return_base ?? 0 },
                  { label: 'Optimistic',   pct: campaign.return_high ?? 0 },
                ].map(s => {
                  const ret = Math.round((amount * s.pct) / 100);
                  const color = s.pct >= 0 ? palette.success : palette.danger;
                  return (
                    <div key={s.label} className="p-2.5 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
                      <p className="text-xs font-black" style={{ color }}>{ret >= 0 ? '+' : ''}${Math.abs(ret)}</p>
                      <p className="text-xs" style={{ color: palette.textSubtle }}>{s.label}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {investError && (
              <p className="text-xs text-center mb-2" style={{ color: palette.danger }}>{investError}</p>
            )}

            <button
              onClick={handleInvest}
              disabled={investing || invested}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
              style={{
                background: invested ? `${palette.success}22` : palette.gradient,
                color: invested ? palette.success : palette.onPrimary,
                opacity: investing ? 0.7 : 1,
              }}
            >
              {invested
                ? <><CheckCircle2 size={16} /> Backed! Redirecting to portfolio…</>
                : investing
                ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                : <><ArrowRight size={16} /> Back This Creator · ${amount.toLocaleString()}</>
              }
            </button>
            <p className="text-center text-xs mt-2" style={{ color: palette.textSubtle }}>
              Simulation only — no real money involved
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={handleInvest}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base"
              style={{ background: palette.gradient, color: palette.onPrimary }}
            >
              <Lock size={16} /> Sign In to Back This Creator
            </button>
            <p className="text-xs text-center mt-2" style={{ color: palette.textSubtle }}>
              Free to join · No real money involved · Simulation only
            </p>
          </>
        )}
      </div>
    </div>
  );
}
