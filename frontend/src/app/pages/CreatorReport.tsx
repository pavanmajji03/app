import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { creators } from '../data/mockData';
import { Star, Shield, TrendingUp, AlertTriangle, ArrowRight, CheckCircle, Youtube, Globe, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const creator = creators[0];

function ScoreGauge({ score }: { score: number }) {
  const { palette } = useTheme();
  const color = score >= 80 ? palette.success : score >= 65 ? palette.warning : palette.danger;
  const label = score >= 80 ? 'Strong' : score >= 65 ? 'Good' : 'Moderate';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke={`${color}18`} strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs font-medium" style={{ color: palette.textMuted }}>/ 100</span>
        </div>
      </div>
      <span
        className="text-sm font-bold mt-2 px-3 py-1 rounded-full"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {label}
      </span>
    </div>
  );
}

function RiskBar({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  const { palette } = useTheme();
  const displayValue = inverse ? 100 - value : value;
  const color = displayValue >= 75 ? palette.success : displayValue >= 50 ? palette.warning : palette.danger;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: palette.textMuted }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{displayValue}/100</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${displayValue}%`, backgroundColor: color, transition: 'width 1s ease' }}
        />
      </div>
    </div>
  );
}

export function CreatorReport() {
  const { palette } = useTheme();
  const navigate = useNavigate();

  const forecastChartData = [
    { period: '30d', Low: creator.forecastData.views30.low, Base: creator.forecastData.views30.base, High: creator.forecastData.views30.high },
    { period: '90d', Low: creator.forecastData.views90.low, Base: creator.forecastData.views90.base, High: creator.forecastData.views90.high },
    { period: '180d', Low: creator.forecastData.views180.low, Base: creator.forecastData.views180.base, High: creator.forecastData.views180.high },
  ];

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Report Header */}
        <div
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{ background: palette.gradient }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: `${palette.onPrimary}18`, color: palette.onPrimary }}
              >
                <Zap size={12} /> AI Underwriting Report
              </div>
              <h1 className="text-2xl font-black mb-1" style={{ color: palette.onPrimary }}>
                {creator.name}
              </h1>
              <p style={{ color: `${palette.onPrimary}cc` }}>
                {creator.handle} · {creator.category} · {creator.location}
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="text-sm" style={{ color: `${palette.onPrimary}cc` }}>
                  <strong style={{ color: palette.onPrimary }}>{creator.subscribers}</strong> subscribers
                </span>
                <span className="text-sm" style={{ color: `${palette.onPrimary}cc` }}>
                  <strong style={{ color: palette.onPrimary }}>{creator.avgViews}</strong> avg views
                </span>
                <span className="text-sm" style={{ color: `${palette.onPrimary}cc` }}>
                  <strong style={{ color: palette.onPrimary }}>{creator.growthRate}</strong> growth
                </span>
              </div>
            </div>
            <ScoreGauge score={creator.aiScore} />
          </div>
        </div>

        {/* Signals analyzed */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Youtube, label: 'YouTube Signals', items: ['8.2M subscribers', '2.1B total views', '30 recent videos', '+18% growth rate', '2× weekly cadence'] },
            { icon: Globe, label: 'Social Signals', items: ['Instagram: 1.2M followers', 'X: 340K followers', '8.9% avg engagement', 'Cross-platform momentum', 'No controversy flags'] },
            { icon: TrendingUp, label: 'Trend Signals', items: ['Tech topics trending ↑', 'Recent collab announcement', 'No viral dependency', 'Consistent top results', 'Strong SEO footprint'] },
          ].map(group => {
            const Icon = group.icon;
            return (
              <div
                key={group.label}
                className="rounded-2xl p-4"
                style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${palette.primary}18` }}
                  >
                    <Icon size={14} style={{ color: palette.primary }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: palette.text }}>{group.label}</span>
                </div>
                {group.items.map(item => (
                  <div key={item} className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle size={10} style={{ color: palette.success }} />
                    <span className="text-xs" style={{ color: palette.textMuted }}>{item}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Chart */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <h3 className="font-bold mb-1" style={{ color: palette.text }}>View Forecast (Millions)</h3>
            <p className="text-xs mb-5" style={{ color: palette.textMuted }}>Low / Base / High scenarios</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={forecastChartData} barGap={3} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke={`${palette.border}60`} vertical={false} />
                <XAxis dataKey="period" tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 10, color: palette.text }}
                  formatter={(v: any) => [`${v}M`, '']}
                />
                <Bar dataKey="Low" fill={palette.warning} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Base" fill={palette.primary} radius={[3, 3, 0, 0]} />
                <Bar dataKey="High" fill={palette.success} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scenario table */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <h3 className="font-bold mb-4" style={{ color: palette.text }}>Revenue Scenarios (180 Days)</h3>
            {[
              {
                label: 'Low',
                desc: 'Conservative floor — designed to be exceeded',
                views: `${creator.forecastData.views180.low}M`,
                revenue: '$630K–$900K',
                color: palette.warning,
              },
              {
                label: 'Base',
                desc: 'Typical expectation based on recent data',
                views: `${creator.forecastData.views180.base}M`,
                revenue: '$960K–$1.4M',
                color: palette.primary,
              },
              {
                label: 'High',
                desc: 'Upside scenario — strong viral uplift',
                views: `${creator.forecastData.views180.high}M`,
                revenue: '$1.4M–$2.0M',
                color: palette.success,
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className="p-3 rounded-xl mb-3"
                style={{ backgroundColor: `${s.color}10`, border: `1px solid ${s.color}25` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ color: s.color }}>{s.label} Scenario</p>
                    <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{s.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: palette.text }}>{s.views} views</p>
                    <p className="text-xs" style={{ color: palette.textMuted }}>{s.revenue} est. revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <h3 className="font-bold mb-4" style={{ color: palette.text }}>Risk Factor Analysis</h3>
            <RiskBar label="Growth Trend" value={creator.riskFactors.growthTrend} />
            <RiskBar label="Cadence Reliability" value={creator.riskFactors.cadenceReliability} />
            <RiskBar label="Platform Diversification" value={creator.riskFactors.platformDiversification} />
            <RiskBar label="Low Volatility (higher = better)" value={creator.riskFactors.volatility} inverse />
            <RiskBar label="Low Concentration Risk (higher = better)" value={creator.riskFactors.concentrationRisk} inverse />
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <h3 className="font-bold mb-4" style={{ color: palette.text }}>AI Assessment Summary</h3>
            <div
              className="p-3 rounded-xl mb-3 flex items-start gap-2"
              style={{ backgroundColor: `${palette.success}12`, border: `1px solid ${palette.success}25` }}
            >
              <Shield size={14} style={{ color: palette.success, marginTop: 1 }} />
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: palette.success }}>Strengths</p>
                <ul className="text-xs space-y-1" style={{ color: palette.textMuted }}>
                  <li>• Exceptionally consistent upload cadence (2× weekly)</li>
                  <li>• Low volatility across 30 recent videos</li>
                  <li>• Strong subscriber growth trajectory (+18%)</li>
                  <li>• Multi-platform presence reduces channel risk</li>
                </ul>
              </div>
            </div>
            <div
              className="p-3 rounded-xl flex items-start gap-2"
              style={{ backgroundColor: `${palette.warning}10`, border: `1px solid ${palette.warning}25` }}
            >
              <AlertTriangle size={14} style={{ color: palette.warning, marginTop: 1 }} />
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: palette.warning }}>Watch Factors</p>
                <ul className="text-xs space-y-1" style={{ color: palette.textMuted }}>
                  <li>• Algorithm dependency in the tech niche</li>
                  <li>• Seasonal dips possible (summer, holidays)</li>
                </ul>
              </div>
            </div>

            <div
              className="mt-4 p-3 rounded-xl"
              style={{ backgroundColor: palette.surfaceAlt }}
            >
              <p className="text-xs" style={{ color: palette.textSubtle }}>Confidence Score</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.bg }}>
                  <div className="h-full rounded-full" style={{ width: '84%', backgroundColor: palette.success }} />
                </div>
                <span className="text-sm font-bold" style={{ color: palette.success }}>84%</span>
              </div>
              <p className="text-xs mt-1" style={{ color: palette.textSubtle }}>Based on 2,400+ data points</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <h3 className="font-bold text-lg mb-2" style={{ color: palette.text }}>
            Ready to create your campaign?
          </h3>
          <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
            Your AI score of <strong style={{ color: palette.success }}>{creator.aiScore}/100</strong> qualifies you for a campaign. Set your terms and go live.
          </p>
          <button
            onClick={() => navigate('/campaign-setup')}
            className="flex items-center justify-center gap-2 mx-auto px-8 py-3 rounded-xl font-bold text-sm"
            style={{ background: palette.gradient, color: palette.onPrimary }}
          >
            Set Up Campaign <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
