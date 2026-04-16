import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { creators } from '../data/mockData';
import {
  TrendingUp, Users, Eye, Clock, Shield, Star, Youtube, Instagram, Twitter,
  PlayCircle, Calendar, ChevronRight, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const creator = creators[0]; // TechVault

function RiskBar({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  const { palette } = useTheme();
  const displayValue = inverse ? 100 - value : value;
  const color = displayValue >= 75 ? palette.success : displayValue >= 50 ? palette.warning : palette.danger;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: palette.textMuted }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{displayValue}/100</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: palette.surfaceAlt }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${displayValue}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function PayoutCalculator() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(100);

  const calcReturn = (pct: number) => ((amount * pct) / 100).toFixed(0);
  const calcTotal = (pct: number) => (amount + Number(calcReturn(pct))).toFixed(0);

  return (
    <div
      className="rounded-2xl p-5 sticky top-24"
      style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
    >
      {/* Campaign header */}
      <div className="mb-4">
        <div
          className="text-xs font-bold tracking-wider mb-1 px-2 py-0.5 rounded inline-block"
          style={{ backgroundColor: `${palette.success}18`, color: palette.success }}
        >
          CAMPAIGN LIVE
        </div>
        <h3 className="font-bold" style={{ color: palette.text }}>TechVault · Season 1</h3>
        <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>
          {creator.term} months · {creator.revenueShare}% revenue share
        </p>
      </div>

      {/* Raise progress */}
      <div className="mb-5 p-3 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: palette.textMuted }}>Raised</span>
          <span style={{ color: palette.text }}>{Math.round((creator.raisedAmount / creator.targetAmount) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.bg }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.round((creator.raisedAmount / creator.targetAmount) * 100)}%`,
              background: palette.gradient,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span style={{ color: palette.text }}>${creator.raisedAmount.toLocaleString()}</span>
          <span style={{ color: palette.textSubtle }}>of ${creator.targetAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Calculator */}
      <div className="mb-4">
        <label className="text-xs font-semibold mb-2 block" style={{ color: palette.textMuted }}>
          Simulate your investment
        </label>
        <div className="relative mb-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold" style={{ color: palette.textMuted }}>$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
            className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-bold outline-none"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.text, border: `1px solid ${palette.border}` }}
          />
        </div>
        <input
          type="range"
          min={10}
          max={5000}
          step={10}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full mb-3"
          style={{ accentColor: palette.primary }}
        />
      </div>

      {/* Payout scenarios */}
      <div className="mb-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${palette.border}` }}>
        {[
          { label: 'Low', pct: creator.returnLow, color: palette.warning },
          { label: 'Base', pct: creator.returnBase, color: palette.success },
          { label: 'High', pct: creator.returnHigh, color: palette.primaryLight },
        ].map((s, i) => (
          <div
            key={s.label}
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderBottom: i < 2 ? `1px solid ${palette.border}` : 'none',
              backgroundColor: s.label === 'Base' ? `${palette.primary}10` : 'transparent',
            }}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: s.color }}>{s.label} Scenario</p>
              <p className="text-xs" style={{ color: palette.textSubtle }}>+{s.pct}% return</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm" style={{ color: palette.text }}>+${calcReturn(s.pct)}</p>
              <p className="text-xs" style={{ color: palette.textSubtle }}>${calcTotal(s.pct)} total</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/portfolio')}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: palette.gradient, color: palette.onPrimary }}
      >
        Paper Invest ${amount.toLocaleString()} <ChevronRight size={16} />
      </button>

      <p className="text-center text-xs mt-3" style={{ color: palette.textSubtle }}>
        Simulation only — no real money involved
      </p>
    </div>
  );
}

export function CreatorPage() {
  const { palette } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'investors'>('overview');

  const forecastChartData = [
    { period: '30 Days', Low: creator.forecastData.views30.low, Base: creator.forecastData.views30.base, High: creator.forecastData.views30.high },
    { period: '90 Days', Low: creator.forecastData.views90.low, Base: creator.forecastData.views90.base, High: creator.forecastData.views90.high },
    { period: '180 Days', Low: creator.forecastData.views180.low, Base: creator.forecastData.views180.base, High: creator.forecastData.views180.high },
  ];

  const platformIcons: Record<string, any> = {
    YouTube: Youtube,
    Instagram: Instagram,
    X: Twitter,
    TikTok: TrendingUp,
    Newsletter: Star,
  };

  return (
    <div style={{ backgroundColor: palette.bg }}>
      {/* Hero */}
      <div
        className="relative h-56 overflow-hidden"
        style={{ borderBottom: `1px solid ${palette.border}` }}
      >
        <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, transparent 0%, ${palette.bg} 100%)` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Creator Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 mb-6 relative z-10">
          <div
            className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ border: `3px solid ${palette.primary}` }}
          >
            <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black" style={{ color: palette.text }}>{creator.name}</h1>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
              >
                {creator.category}
              </span>
            </div>
            <p className="text-sm mb-2" style={{ color: palette.textMuted }}>{creator.handle} · {creator.location}</p>
            <div className="flex items-center gap-4 text-xs">
              <span style={{ color: palette.textMuted }}><strong style={{ color: palette.text }}>{creator.subscribers}</strong> subscribers</span>
              <span style={{ color: palette.textMuted }}><strong style={{ color: palette.text }}>{creator.avgViews}</strong> avg views</span>
              <span style={{ color: palette.success }}><strong>{creator.growthRate}</strong> growth</span>
            </div>
          </div>
          {/* AI Score */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-shrink-0"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <div>
              <p className="text-xs" style={{ color: palette.textMuted }}>AI Score</p>
              <p className="text-3xl font-black" style={{ color: palette.success }}>{creator.aiScore}</p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${palette.success}18` }}
            >
              <Star size={22} style={{ color: palette.success }} fill={palette.success} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8" style={{ borderBottom: `1px solid ${palette.border}` }}>
          {(['overview', 'report', 'investors'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm font-medium capitalize transition-all"
              style={{
                color: activeTab === tab ? palette.primary : palette.textMuted,
                borderBottom: activeTab === tab ? `2px solid ${palette.primary}` : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab === 'report' ? 'AI Report' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* Left: Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <>
                {/* About */}
                <div className="mb-6 p-5 rounded-2xl" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
                  <h3 className="font-bold mb-3" style={{ color: palette.text }}>About this Channel</h3>
                  <p className="text-sm leading-relaxed" style={{ color: palette.textMuted }}>{creator.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {creator.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: palette.surfaceAlt, color: palette.textMuted }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    {creator.platforms.map(platform => {
                      const Icon = platformIcons[platform] || TrendingUp;
                      return (
                        <div
                          key={platform}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                          style={{ backgroundColor: palette.surfaceAlt, color: palette.textMuted }}
                        >
                          <Icon size={12} />
                          {platform}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Videos */}
                <div className="mb-6 p-5 rounded-2xl" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
                  <h3 className="font-bold mb-4" style={{ color: palette.text }}>Recent Videos</h3>
                  <div className="flex flex-col gap-3">
                    {creator.recentVideos.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: palette.surfaceAlt }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${palette.primary}22` }}
                        >
                          <PlayCircle size={18} style={{ color: palette.primary }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: palette.text }}>{v.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{v.views} views</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs" style={{ color: palette.textSubtle }}>{v.daysAgo}d ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'report' && (
              <>
                {/* View Forecast Chart */}
                <div className="mb-6 p-5 rounded-2xl" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
                  <h3 className="font-bold mb-1" style={{ color: palette.text }}>View Forecast (Millions)</h3>
                  <p className="text-xs mb-5" style={{ color: palette.textMuted }}>Low / Base / High projections over 30, 90, 180 days</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={forecastChartData} barGap={4} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke={`${palette.border}60`} vertical={false} />
                      <XAxis dataKey="period" tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 10, color: palette.text }}
                        labelStyle={{ color: palette.text }}
                        formatter={(v: any) => [`${v}M views`, '']}
                      />
                      <Legend wrapperStyle={{ color: palette.textMuted, fontSize: 11, paddingTop: 12 }} />
                      <Bar dataKey="Low" fill={palette.warning} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Base" fill={palette.primary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="High" fill={palette.success} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Risk Factors */}
                <div className="p-5 rounded-2xl" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
                  <h3 className="font-bold mb-4" style={{ color: palette.text }}>Risk Factor Analysis</h3>
                  <RiskBar label="Growth Trend" value={creator.riskFactors.growthTrend} />
                  <RiskBar label="Cadence Reliability" value={creator.riskFactors.cadenceReliability} />
                  <RiskBar label="Platform Diversification" value={creator.riskFactors.platformDiversification} />
                  <RiskBar label="Volatility (lower = better)" value={creator.riskFactors.volatility} inverse />
                  <RiskBar label="Concentration Risk (lower = better)" value={creator.riskFactors.concentrationRisk} inverse />

                  <div
                    className="mt-4 p-3 rounded-xl flex items-start gap-2"
                    style={{ backgroundColor: `${palette.success}12`, border: `1px solid ${palette.success}30` }}
                  >
                    <Shield size={14} style={{ color: palette.success, marginTop: 1 }} className="flex-shrink-0" />
                    <p className="text-xs leading-relaxed" style={{ color: palette.success }}>
                      <strong>AI Assessment:</strong> TechVault demonstrates strong consistency and low volatility. High cadence reliability and growing subscriber base signal durable performance.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'investors' && (
              <div className="p-5 rounded-2xl" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
                <h3 className="font-bold mb-4" style={{ color: palette.text }}>Investor Activity</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Alex R.', amount: 500, days: 2 },
                    { name: 'Jordan M.', amount: 1000, days: 4 },
                    { name: 'Casey T.', amount: 250, days: 6 },
                    { name: 'Sam K.', amount: 750, days: 9 },
                    { name: 'Riley P.', amount: 200, days: 12 },
                  ].map((inv, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ backgroundColor: palette.surfaceAlt }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: palette.gradient, color: palette.onPrimary }}
                        >
                          {inv.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: palette.text }}>{inv.name}</p>
                          <p className="text-xs" style={{ color: palette.textSubtle }}>{inv.days} days ago</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm" style={{ color: palette.primary }}>
                        ${inv.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs mt-4" style={{ color: palette.textSubtle }}>
                  {creator.investorCount} total investors · {Math.round((creator.raisedAmount / creator.targetAmount) * 100)}% funded
                </p>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div>
            <PayoutCalculator />
          </div>
        </div>
      </div>
    </div>
  );
}
