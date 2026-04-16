import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { callApi } from '../services/apiService';
import {
  ChevronLeft, Star, TrendingUp, Users, Shield, Loader2,
  BarChart2, DollarSign, PlayCircle, GitCompare,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────────

interface FullReport {
  ai_underwriting_report?: {
    channel_name?: string;
    handle?: string;
    thumbnail_url?: string | null;
    niche?: string;
    location?: string;
    subscribers?: string;
    avg_views?: string;
    growth_rate?: string;
    ai_score?: number;
    ai_score_label?: string;
    total_views?: string;
    total_videos?: string;
    recent_performance?: string;
  };
  youtube_signals?: {
    subscribers?: string;
    total_views?: string;
    growth_rate?: string;
    cadence?: string;
    engagement_rate?: string;
    recent_videos?: string;
    p10_p50_p90_views?: { p10?: string; p50?: string; p90?: string };
    recent_videos_preview?: { title: string; views: string; days_ago: number; thumbnail?: string }[];
    notes?: string;
  };
  social_signals?: {
    instagram?: { followers?: string; engagement_rate?: string };
    twitter_x?: { followers?: string };
    linkedin?: { url?: string };
    cross_platform_momentum?: string;
    no_controversy_flags?: boolean;
  };
  trending_topics_analysis?: {
    top_trending_topics?: string[];
    momentum?: string;
  };
  view_forecast_millions?: {
    low_conservative?: { '30d'?: number; '90d'?: number; '180d'?: number; '365d'?: number };
    base_expected?: { '30d'?: number; '90d'?: number; '180d'?: number; '365d'?: number };
    high_optimistic?: { '30d'?: number; '90d'?: number; '180d'?: number; '365d'?: number };
  };
  revenue_scenarios_adsense?: {
    '90d'?: { low?: { estimated_revenue?: string }; base?: { estimated_revenue?: string }; high?: { estimated_revenue?: string } };
    '180d'?: { low?: { estimated_revenue?: string }; base?: { estimated_revenue?: string }; high?: { estimated_revenue?: string } };
    '365d'?: { low?: { estimated_revenue?: string }; base?: { estimated_revenue?: string }; high?: { estimated_revenue?: string } };
    rpm_used?: number;
  };
  risk_factor_analysis?: {
    growth_trend?: number;
    cadence_reliability?: number;
    platform_diversification?: number;
    low_volatility_higher_is_better?: number;
    low_concentration_risk_higher_is_better?: number;
  };
  ai_assessment_summary?: {
    narrative?: string;
    strengths?: string[];
    watch_factors?: string[];
    estimated_monthly_adsense_income?: string;
    confidence_score?: number;
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RiskBar({ label, value }: { label: string; value: number }) {
  const { palette } = useTheme();
  const color = value >= 75 ? palette.success : value >= 50 ? palette.warning : palette.danger;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: palette.textMuted }}>{label}</span>
        <span className="font-semibold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: palette.surfaceAlt }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${palette.border}` }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{ backgroundColor: palette.surface, borderBottom: `1px solid ${palette.border}` }}>
        <Icon size={14} style={{ color: palette.primary }} />
        <h3 className="font-bold text-sm" style={{ color: palette.text }}>{title}</h3>
      </div>
      <div className="p-5" style={{ backgroundColor: palette.bg }}>{children}</div>
    </div>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { palette } = useTheme();
  return (
    <div className="text-center px-4 py-3 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
      <p className="text-base font-bold" style={{ color: highlight ? palette.success : palette.text }}>{value || '—'}</p>
      <p className="text-xs mt-0.5" style={{ color: palette.textSubtle }}>{label}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function BrandCreatorReport() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const analysisId = new URLSearchParams(location.search).get('analysis_id');

  useEffect(() => {
    if (!analysisId) {
      setError('No analysis ID provided.');
      setLoading(false);
      return;
    }
    callApi<{ status: string; report: FullReport }>(
      'pollAnalysis_CreatorAnalysis',
      { pathParams: { analysis_id: analysisId } }
    )
      .then(res => {
        if (res.data?.status === 'completed' && res.data.report) {
          setReport(res.data.report);
        } else {
          setError('Report not available or still processing.');
        }
      })
      .catch(() => setError('Failed to load creator report.'))
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin" style={{ color: palette.primary }} />
          <p className="text-sm" style={{ color: palette.textMuted }}>Loading AI report…</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: palette.text }}>{error || 'Report not found'}</p>
          <button onClick={() => navigate(-1)} className="text-sm underline" style={{ color: palette.primary }}>Go back</button>
        </div>
      </div>
    );
  }

  const r = report.ai_underwriting_report;
  const yt = report.youtube_signals;
  const soc = report.social_signals;
  const topics = report.trending_topics_analysis;
  const fc = report.view_forecast_millions;
  const rev = report.revenue_scenarios_adsense;
  const risk = report.risk_factor_analysis;
  const ai = report.ai_assessment_summary;

  const aiScore = r?.ai_score ?? 0;
  const scoreColor = aiScore >= 80 ? palette.success : aiScore >= 70 ? palette.warning : aiScore >= 60 ? '#F97316' : palette.danger;

  // View forecast chart data
  const forecastData = fc ? [
    { period: '30d', Low: fc.low_conservative?.['30d'], Base: fc.base_expected?.['30d'], High: fc.high_optimistic?.['30d'] },
    { period: '90d', Low: fc.low_conservative?.['90d'], Base: fc.base_expected?.['90d'], High: fc.high_optimistic?.['90d'] },
    { period: '180d', Low: fc.low_conservative?.['180d'], Base: fc.base_expected?.['180d'], High: fc.high_optimistic?.['180d'] },
  ] : [];

  const chartTooltipStyle = { backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 10 };

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
            style={{ color: palette.textMuted, backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <button
            onClick={() => navigate('/creator-comparison')}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg font-semibold"
            style={{ color: palette.primary, backgroundColor: `${palette.primary}12`, border: `1px solid ${palette.primary}30` }}
          >
            <GitCompare size={14} /> Add to Comparison
          </button>
        </div>

        {/* Hero card */}
        <div
          className="rounded-3xl p-6 mb-6"
          style={{ background: `linear-gradient(135deg, ${palette.surface}, ${palette.surfaceAlt})`, border: `1px solid ${palette.border}` }}
        >
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: `2px solid ${scoreColor}40` }}>
              {r?.thumbnail_url
                ? <img src={r.thumbnail_url} alt={r?.channel_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ background: `${scoreColor}20`, color: scoreColor }}>{r?.channel_name?.[0] ?? '?'}</div>
              }
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-black" style={{ color: palette.text }}>{r?.channel_name || 'Creator'}</h1>
                {r?.niche && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}>{r.niche}</span>
                )}
              </div>
              <p className="text-sm mb-1" style={{ color: palette.textMuted }}>{r?.handle}</p>
              {r?.location && <p className="text-xs" style={{ color: palette.textSubtle }}>📍 {r.location}</p>}

              {r?.recent_performance && (
                <p className="text-xs mt-2" style={{ color: palette.textSubtle }}>📹 {r.recent_performance}</p>
              )}
            </div>

            {/* AI Score */}
            <div className="flex-shrink-0 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center"
                style={{ backgroundColor: `${scoreColor}12`, border: `2px solid ${scoreColor}40` }}
              >
                <span className="text-3xl font-black" style={{ color: scoreColor }}>{aiScore}</span>
                <Star size={12} fill={scoreColor} strokeWidth={0} style={{ color: scoreColor }} />
              </div>
              <p className="text-xs mt-1 font-semibold" style={{ color: scoreColor }}>{r?.ai_score_label || 'AI Score'}</p>
            </div>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <StatPill label="Subscribers" value={r?.subscribers || yt?.subscribers || '—'} />
            <StatPill label="Avg Views" value={r?.avg_views || '—'} />
            <StatPill label="Growth Rate" value={r?.growth_rate || yt?.growth_rate || '—'} highlight />
            <StatPill label="Total Videos" value={r?.total_videos || '—'} />
          </div>
        </div>

        {/* Two-column grid for signal cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">

          {/* YouTube Signals */}
          {yt && (
            <Card title="YouTube Signals" icon={BarChart2}>
              <div className="space-y-2">
                {[
                  { label: 'Total Views', value: yt.total_views },
                  { label: 'Upload Cadence', value: yt.cadence },
                  { label: 'Engagement Rate', value: yt.engagement_rate },
                  { label: 'Recent Videos', value: yt.recent_videos },
                ].map(m => m.value && (
                  <div key={m.label} className="flex justify-between text-sm py-1" style={{ borderBottom: `1px solid ${palette.border}22` }}>
                    <span style={{ color: palette.textMuted }}>{m.label}</span>
                    <span className="font-semibold" style={{ color: palette.text }}>{m.value}</span>
                  </div>
                ))}
                {yt.p10_p50_p90_views && (
                  <div className="pt-1">
                    <p className="text-xs mb-1" style={{ color: palette.textSubtle }}>P10 / P50 / P90 Views</p>
                    <p className="text-sm font-bold" style={{ color: palette.text }}>
                      {yt.p10_p50_p90_views.p10} / {yt.p10_p50_p90_views.p50} / {yt.p10_p50_p90_views.p90}
                    </p>
                  </div>
                )}
                {yt.notes && <p className="text-xs mt-2" style={{ color: palette.textSubtle }}>{yt.notes}</p>}
              </div>
            </Card>
          )}

          {/* Social Signals */}
          {soc && (
            <Card title="Social Signals" icon={Users}>
              <div className="space-y-2">
                {soc.instagram && (
                  <div className="flex items-center gap-2 py-1" style={{ borderBottom: `1px solid ${palette.border}22` }}>
                    <span className="text-xs font-bold w-6" style={{ color: '#E1306C' }}>IG</span>
                    <span className="text-sm flex-1" style={{ color: palette.text }}>{soc.instagram.followers} followers</span>
                    {soc.instagram.engagement_rate && <span className="text-xs" style={{ color: palette.textSubtle }}>{soc.instagram.engagement_rate} eng</span>}
                  </div>
                )}
                {soc.twitter_x && (
                  <div className="flex items-center gap-2 py-1" style={{ borderBottom: `1px solid ${palette.border}22` }}>
                    <span className="text-xs font-bold w-6" style={{ color: '#1DA1F2' }}>𝕏</span>
                    <span className="text-sm" style={{ color: palette.text }}>{soc.twitter_x.followers} followers</span>
                  </div>
                )}
                {soc.cross_platform_momentum && (
                  <p className="text-xs py-1" style={{ color: palette.textMuted }}>{soc.cross_platform_momentum}</p>
                )}
                {soc.no_controversy_flags != null && (
                  <p className="text-sm font-semibold" style={{ color: soc.no_controversy_flags ? palette.success : palette.danger }}>
                    {soc.no_controversy_flags ? '✓ No controversy flags' : '⚠ Controversy signals detected'}
                  </p>
                )}
              </div>

              {/* Trending Topics */}
              {topics?.top_trending_topics && topics.top_trending_topics.length > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: palette.textSubtle }}>TRENDING TOPICS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.top_trending_topics.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${palette.primary}12`, color: palette.primaryLight }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {topics.momentum && <p className="text-xs mt-2" style={{ color: palette.textSubtle }}>Momentum: {topics.momentum}</p>}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* View Forecast Chart */}
        {fc && forecastData.some(d => d.Base != null) && (
          <div className="mb-6">
            <Card title="View Forecast — Millions" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={forecastData} barGap={4} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke={`${palette.border}60`} vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: palette.text }} formatter={(v: any) => [`${v}M views`, '']} />
                  <Bar dataKey="Low" fill={palette.warning} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Base" fill={palette.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="High" fill={palette.success} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Revenue Scenarios */}
        {rev && (
          <div className="mb-6">
            <Card title="Revenue Scenarios (AdSense)" icon={DollarSign}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['90d', '180d', '365d'] as const).map(term => (
                  <div key={term} className="rounded-xl p-4" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: palette.textMuted }}>{term.toUpperCase()}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: palette.warning }}>Conservative</span>
                        <span className="font-semibold" style={{ color: palette.text }}>{rev[term]?.low?.estimated_revenue || '—'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: palette.primary }}>Expected</span>
                        <span className="font-semibold" style={{ color: palette.text }}>{rev[term]?.base?.estimated_revenue || '—'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: palette.success }}>Optimistic</span>
                        <span className="font-semibold" style={{ color: palette.text }}>{rev[term]?.high?.estimated_revenue || '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {rev.rpm_used && (
                <p className="text-xs mt-3" style={{ color: palette.textSubtle }}>RPM used: ${rev.rpm_used}/1K views</p>
              )}
            </Card>
          </div>
        )}

        {/* Risk Factor Analysis */}
        {risk && (
          <div className="mb-6">
            <Card title="Risk Factor Analysis" icon={Shield}>
              <RiskBar label="Growth Trend" value={risk.growth_trend ?? 50} />
              <RiskBar label="Cadence Reliability" value={risk.cadence_reliability ?? 50} />
              <RiskBar label="Platform Diversification" value={risk.platform_diversification ?? 50} />
              <RiskBar label="Low Volatility" value={risk.low_volatility_higher_is_better ?? 50} />
              <RiskBar label="Low Concentration Risk" value={risk.low_concentration_risk_higher_is_better ?? 50} />
            </Card>
          </div>
        )}

        {/* Recent Videos */}
        {yt?.recent_videos_preview && yt.recent_videos_preview.length > 0 && (
          <div className="mb-6">
            <Card title="Recent Videos" icon={PlayCircle}>
              <div className="space-y-3">
                {yt.recent_videos_preview.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-14 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ backgroundColor: `${palette.primary}18` }}>
                      {v.thumbnail
                        ? <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><PlayCircle size={14} style={{ color: palette.primary }} /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate" style={{ color: palette.text }}>{v.title}</p>
                      <p className="text-xs" style={{ color: palette.textSubtle }}>{v.views} · {v.days_ago}d ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* AI Assessment */}
        {ai && (
          <div className="mb-6">
            <Card title="AI Assessment" icon={Star}>
              {ai.narrative && (
                <p className="text-sm leading-relaxed mb-4" style={{ color: palette.textMuted }}>{ai.narrative}</p>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {ai.strengths && ai.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: palette.success }}>STRENGTHS</p>
                    {ai.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span style={{ color: palette.success }}>✓</span>
                        <span className="text-sm" style={{ color: palette.textMuted }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
                {ai.watch_factors && ai.watch_factors.length > 0 && (
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: palette.warning }}>WATCH FACTORS</p>
                    {ai.watch_factors.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span style={{ color: palette.warning }}>⚠</span>
                        <span className="text-sm" style={{ color: palette.textMuted }}>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {(ai.estimated_monthly_adsense_income || ai.confidence_score != null) && (
                <div className="flex items-center gap-6 mt-4 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
                  {ai.estimated_monthly_adsense_income && (
                    <div>
                      <p className="text-xs" style={{ color: palette.textSubtle }}>Est. Monthly Income</p>
                      <p className="text-lg font-black" style={{ color: palette.success }}>{ai.estimated_monthly_adsense_income}</p>
                    </div>
                  )}
                  {ai.confidence_score != null && (
                    <div>
                      <p className="text-xs" style={{ color: palette.textSubtle }}>Confidence Score</p>
                      <p className="text-lg font-black" style={{ color: palette.primary }}>{ai.confidence_score}/100</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
