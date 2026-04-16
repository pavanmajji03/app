import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { portfolioInvestments, portfolioChartData } from '../data/mockData';
import { TrendingUp, DollarSign, BarChart2, Clock, ChevronRight, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function MetricCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  const { palette } = useTheme();
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
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

export function Portfolio() {
  const { palette } = useTheme();
  const navigate = useNavigate();

  const totalInvested = portfolioInvestments.reduce((s, i) => s + i.invested, 0);
  const totalEarned = portfolioInvestments.reduce((s, i) => s + i.earned, 0);
  const totalValue = portfolioInvestments.reduce((s, i) => s + i.currentValue, 0);

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: palette.text }}>My Portfolio</h1>
            <p style={{ color: palette.textMuted }}>Paper investments · March 2026</p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: palette.gradient, color: palette.onPrimary }}
          >
            Add Investment <ChevronRight size={14} />
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={DollarSign}
            label="Total Invested"
            value={`$${totalInvested.toLocaleString()}`}
            sub="Paper portfolio"
            color={palette.primary}
          />
          <MetricCard
            icon={TrendingUp}
            label="Total Earned"
            value={`$${totalEarned.toFixed(2)}`}
            sub="+2.1% return so far"
            color={palette.success}
          />
          <MetricCard
            icon={BarChart2}
            label="Portfolio Value"
            value={`$${totalValue.toFixed(0)}`}
            sub="Updated Mar 2026"
            color={palette.primaryLight}
          />
          <MetricCard
            icon={Clock}
            label="Active Campaigns"
            value={`${portfolioInvestments.length}`}
            sub="Next payout Apr 1"
            color={palette.accent}
          />
        </div>

        {/* Chart + Investments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Chart */}
          <div
            className="lg:col-span-2 rounded-2xl p-5"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <h3 className="font-bold mb-1" style={{ color: palette.text }}>Portfolio Performance</h3>
            <p className="text-xs mb-5" style={{ color: palette.textMuted }}>Paper portfolio value over time</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={portfolioChartData}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={palette.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.success} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={palette.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={`${palette.border}60`} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 10, color: palette.text }}
                  formatter={(v: any, name: string) => [`$${v}`, name === 'portfolio' ? 'Portfolio Value' : 'Earned']}
                />
                <Area type="monotone" dataKey="portfolio" stroke={palette.primary} fill="url(#portfolioGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="earned" stroke={palette.success} fill="url(#earnedGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* IOI Box */}
          <div
            className="rounded-2xl p-5 flex flex-col justify-between"
            style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
          >
            <div>
              <div
                className="text-xs font-bold tracking-wider px-2 py-0.5 rounded inline-block mb-3"
                style={{ backgroundColor: `${palette.accent}20`, color: palette.accent }}
              >
                INDICATION OF INTEREST
              </div>
              <h3 className="font-bold mb-2" style={{ color: palette.text }}>Ready for Real Investing?</h3>
              <p className="text-sm mb-4" style={{ color: palette.textMuted }}>
                Submit a non-binding IOI — tell us how much you'd invest when real money goes live.
              </p>
            </div>
            <div>
              <div
                className="rounded-xl p-4 mb-4"
                style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
              >
                <p className="text-xs mb-2" style={{ color: palette.textMuted }}>If real investing were live, I'd invest:</p>
                <div className="flex gap-2">
                  {['$500', '$1K', '$5K', '$10K+'].map(amt => (
                    <button
                      key={amt}
                      className="flex-1 text-xs py-1.5 rounded-lg"
                      style={{ backgroundColor: palette.surfaceAlt, color: palette.textMuted, border: `1px solid ${palette.border}` }}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: palette.accentGradient, color: palette.onAccent }}
              >
                Submit IOI
              </button>
            </div>
          </div>
        </div>

        {/* Investments */}
        <div className="mt-6">
          <h3 className="font-bold mb-4" style={{ color: palette.text }}>Active Investments</h3>
          <div className="flex flex-col gap-4">
            {portfolioInvestments.map(inv => {
              const pct = Math.round((inv.monthsIn / inv.term) * 100);
              return (
                <div
                  key={inv.id}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Creator Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ border: `2px solid ${palette.primary}` }}
                      >
                        <img src={inv.image} alt={inv.creatorName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: palette.text }}>{inv.creatorName}</p>
                        <p className="text-xs" style={{ color: palette.textMuted }}>{inv.category}</p>
                        <div
                          className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block"
                          style={{ backgroundColor: `${palette.success}15`, color: palette.success }}
                        >
                          Active
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div>
                        <p className="text-xs" style={{ color: palette.textMuted }}>Invested</p>
                        <p className="font-bold" style={{ color: palette.text }}>${inv.invested}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: palette.textMuted }}>Earned</p>
                        <p className="font-bold" style={{ color: palette.success }}>+${inv.earned.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: palette.textMuted }}>Base Return</p>
                        <p className="font-bold" style={{ color: palette.primaryLight }}>+{inv.returnBase}%</p>
                      </div>
                    </div>

                    {/* Term Progress */}
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: palette.textMuted }}>Term Progress</span>
                        <span style={{ color: palette.text }}>{inv.monthsIn}/{inv.term} mo</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: palette.gradient }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: palette.textSubtle }}>Next: {inv.nextPayout}</p>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => navigate('/statement')}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: palette.surfaceAlt, color: palette.primary, border: `1px solid ${palette.border}` }}
                    >
                      <FileText size={12} /> Statement
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
