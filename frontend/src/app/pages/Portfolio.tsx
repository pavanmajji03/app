import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import { DollarSign, BarChart2, Clock, ChevronRight, Zap } from 'lucide-react';

interface FanInvestment {
  investment_id: string;
  campaign_id: string;
  amount: number;
  invested_at: string | null;
  creator_name: string;
  creator_handle: string;
  creator_thumbnail: string;
  genres: string[];
  term_months: number;
  revenue_share_pct: number;
  return_low: number;
  return_base: number;
  return_high: number;
  start_date: string | null;
  status: string;
}

function MetricCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  const { palette } = useTheme();
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-xs" style={{ color: palette.textMuted }}>{label}</span>
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: palette.text }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: palette.textSubtle }}>{sub}</p>}
      </div>
    </div>
  );
}

function monthsElapsed(investedAt: string | null, startDate: string | null): number {
  const ref = startDate ?? investedAt;
  if (!ref) return 0;
  const from = new Date(ref);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth()));
}

/**
 * YouTube YPP payout timeline:
 *  - Month N revenue earned (e.g. May)
 *  - Finalized by YouTube ~June 10th
 *  - YouTube pays creator June 21-26
 *  - FanZFolio distributes to fans with 2-3 day buffer → by ~July 10th
 *
 * So: first payout = start_month + 2 months, around the 10th
 * Subsequent payouts: every month thereafter on the 10th
 */
function nextPayoutDate(startDate: string | null, investedAt: string | null): { label: string; note: string } {
  const ref = startDate ?? investedAt;
  if (!ref) return { label: 'TBD', note: 'Once campaign starts' };

  const start = new Date(ref);
  const firstPayout = new Date(start.getFullYear(), start.getMonth() + 2, 10);
  const now = new Date();

  let next = new Date(firstPayout);
  while (next <= now) {
    next = new Date(next.getFullYear(), next.getMonth() + 1, 10);
  }

  const fmt = next.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const monthName = new Date(next.getFullYear(), next.getMonth() - 1, 1)
    .toLocaleDateString('en-US', { month: 'long' });
  return { label: fmt, note: `For ${monthName} revenue` };
}

export function Portfolio() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [investments, setInvestments] = useState<FanInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    callApi<FanInvestment[]>('getMyInvestments_Portfolio', { pathParams: { fan_email: user.email } })
      .then(res => { setInvestments(res.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const nextPayout = investments.length > 0
    ? investments.map(i => nextPayoutDate(i.start_date, i.invested_at))
        .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime())[0]
    : null;
  const nowLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: palette.bg }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${palette.primary}40`, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: palette.text }}>My Portfolio</h1>
            <p style={{ color: palette.textMuted }}>Your paper backing portfolio · {nowLabel}</p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: palette.gradient, color: palette.onPrimary }}
          >
            Back a Creator <ChevronRight size={14} />
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <MetricCard icon={DollarSign} label="Total Backed" value={`$${totalInvested.toLocaleString()}`} sub="Paper backing portfolio" color={palette.primary} />
          <MetricCard icon={BarChart2} label="Creators Backed" value={`${investments.length}`} sub={investments.length === 1 ? '1 active backing' : `${investments.length} active backings`} color={palette.primaryLight} />
          <MetricCard
            icon={Clock}
            label="Next Payout"
            value={nextPayout?.label ?? 'TBD'}
            sub={nextPayout?.note ?? 'Once campaign starts'}
            color={palette.accent}
          />
        </div>

        {/* Investments list */}
        <div>
          <h3 className="font-bold mb-4" style={{ color: palette.text }}>Creators You're Backing</h3>

          {investments.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <Zap size={32} className="mx-auto mb-4 opacity-30" style={{ color: palette.primary }} />
              <p className="font-semibold mb-1" style={{ color: palette.text }}>You haven't backed any creators yet</p>
              <p className="text-sm mb-4" style={{ color: palette.textMuted }}>Browse the marketplace and back a creator you believe in.</p>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: palette.gradient, color: palette.onPrimary }}
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {investments.map(inv => {
                const elapsed = monthsElapsed(inv.invested_at, inv.start_date);
                const pct = Math.min(100, Math.round((elapsed / inv.term_months) * 100));
                const investedDate = inv.invested_at
                  ? new Date(inv.invested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—';
                const payout = nextPayoutDate(inv.start_date, inv.invested_at);
                const startLabel = inv.start_date
                  ? new Date(inv.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'TBD';

                return (
                  <div
                    key={inv.investment_id}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
                  >
                    {/* Top row: creator + action */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                          style={{ border: `2px solid ${palette.primary}30`, backgroundColor: `${palette.primary}18` }}
                        >
                          {inv.creator_thumbnail
                            ? <img src={inv.creator_thumbnail} alt={inv.creator_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            : <span className="text-base font-black opacity-40" style={{ color: palette.primary }}>{inv.creator_name?.[0]}</span>
                          }
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: palette.text }}>{inv.creator_name}</p>
                          <p className="text-xs" style={{ color: palette.textMuted }}>{inv.creator_handle}</p>
                        </div>
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${palette.success}15`, color: palette.success }}>Active</span>
                          {inv.genres[0] && (
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${palette.primary}15`, color: palette.primary }}>{inv.genres[0]}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/campaign/${inv.campaign_id}`)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl flex-shrink-0"
                        style={{ backgroundColor: palette.surfaceAlt, color: palette.primary, border: `1px solid ${palette.border}` }}
                      >
                        View Campaign <ChevronRight size={11} />
                      </button>
                    </div>

                    {/* Stats pills row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: palette.surfaceAlt }}>
                        <span style={{ color: palette.textMuted }}>Backed</span>
                        <span className="font-semibold" style={{ color: palette.text }}>${inv.amount.toLocaleString()}</span>
                        <span style={{ color: palette.textSubtle }}>· {investedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: palette.surfaceAlt }}>
                        <span style={{ color: palette.textMuted }}>Expected Return Range</span>
                        <span className="font-semibold" style={{ color: palette.text }}>{inv.return_low}% to {inv.return_high}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: `${palette.accent}12` }}>
                        <Clock size={11} style={{ color: palette.accent }} />
                        <span style={{ color: palette.accent }} className="font-medium">Next payout {payout.label}</span>
                        <span style={{ color: palette.textSubtle }}>· {payout.note}</span>
                      </div>
                    </div>

                    {/* Term progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: palette.textMuted }}>Term Progress · Started {startLabel}</span>
                        <span style={{ color: palette.text }}>{elapsed}/{inv.term_months} mo</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: palette.gradient }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* IOI Box */}
        {investments.length > 0 && (
          <div
            className="mt-8 rounded-2xl p-6 text-center"
            style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
          >
            <div className="text-xs font-bold tracking-wider px-2 py-0.5 rounded inline-block mb-3" style={{ backgroundColor: `${palette.accent}20`, color: palette.accent }}>
              INDICATION OF INTEREST
            </div>
            <h3 className="font-bold mb-2" style={{ color: palette.text }}>Ready to Back Creators for Real?</h3>
            <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: palette.textMuted }}>
              Submit a non-binding IOI — tell us how much you'd back when real money goes live.
            </p>
            <div className="flex gap-2 justify-center mb-4">
              {['$500', '$1K', '$5K', '$10K+'].map(amt => (
                <button key={amt} className="text-xs px-4 py-1.5 rounded-lg" style={{ backgroundColor: palette.surface, color: palette.textMuted, border: `1px solid ${palette.border}` }}>
                  {amt}
                </button>
              ))}
            </div>
            <button className="px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: palette.accentGradient, color: palette.onAccent }}>
              Submit IOI
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
