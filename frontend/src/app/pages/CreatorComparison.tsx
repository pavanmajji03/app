import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { callApi } from '../services/apiService';
import {
  Search, X, Star, TrendingUp, Users, Shield,
  ChevronLeft, Loader2, GitCompare, CheckCircle2, Circle,
  PlayCircle, DollarSign,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Campaign {
  campaign_id: string;
  analysis_id?: string | null;
  creator_name: string;
  creator_handle: string;
  creator_thumbnail: string;
  ai_score: number;
  risk_level: string;
  genres: string[];
  niche: string;
  subscribers: string;
  avg_views: string;
  growth_rate: string;
  term_months: number;
  revenue_share_pct: number;
  target_amount: number;
  raised_amount: number;
  investor_count: number;
  return_low: number;
  return_base: number;
  return_high: number;
}

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

const COLORS = ['#8B3DFF', '#2563EB', '#00C896', '#E8B423'];
const MAX_SELECT = 4;

function pct(raised: number, target: number) {
  return target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
}

function riskColor(level: string, palette: any): string {
  return ({ Low: palette.success, 'Low-Med': '#84CC16', Medium: palette.warning, High: palette.danger } as any)[level] || palette.warning;
}

// ── Creator Card ───────────────────────────────────────────────────────────────

function CreatorCard({ item, selected, onToggle, color, loadingReport }: {
  item: Campaign; selected: boolean; onToggle: () => void; color: string; loadingReport: boolean;
}) {
  const { palette } = useTheme();
  const rc = riskColor(item.risk_level, palette);
  const sc = item.ai_score >= 80 ? palette.success : item.ai_score >= 70 ? palette.warning : item.ai_score >= 60 ? '#F97316' : palette.danger;

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl"
      style={{ backgroundColor: palette.surface, border: `2px solid ${selected ? color : palette.border}`, boxShadow: selected ? `0 0 0 1px ${color}40` : undefined }}
      onClick={onToggle}
    >
      <div className="relative h-36 overflow-hidden" style={{ backgroundColor: `${color}18` }}>
        {item.creator_thumbnail ? (
          <img src={item.creator_thumbnail} alt={item.creator_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-black opacity-20" style={{ color }}>{item.creator_name?.[0] ?? '?'}</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${palette.surface} 0%, transparent 50%)` }} />
        <div className="absolute top-3 left-3">
          {selected ? <CheckCircle2 size={20} style={{ color }} fill={color} /> : <Circle size={20} style={{ color: palette.textSubtle }} />}
        </div>
        {selected && loadingReport && (
          <div className="absolute top-3 right-14"><Loader2 size={14} className="animate-spin" style={{ color }} /></div>
        )}
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}18`, color: sc, border: `1px solid ${sc}30` }}>
            <Star size={10} fill={sc} strokeWidth={0} /> {item.ai_score}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm truncate" style={{ color: palette.text }}>{item.creator_name}</h3>
            <p className="text-xs" style={{ color: palette.textMuted }}>{item.creator_handle}</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ backgroundColor: `${rc}18`, color: rc, border: `1px solid ${rc}30` }}>
            {item.risk_level}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 mb-3 py-2.5" style={{ borderTop: `1px solid ${palette.border}`, borderBottom: `1px solid ${palette.border}` }}>
          {[
            { label: 'Subs', value: item.subscribers },
            { label: 'Avg Views', value: item.avg_views },
            { label: 'Growth', value: item.growth_rate, highlight: true },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-xs font-bold" style={{ color: m.highlight ? palette.success : palette.text }}>{m.value || '—'}</p>
              <p className="text-xs" style={{ color: palette.textSubtle }}>{m.label}</p>
            </div>
          ))}
        </div>

        {item.genres[0] && (
          <div className="flex items-center justify-end mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${palette.primary}12`, color: palette.primaryLight }}>{item.genres[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Compare View ───────────────────────────────────────────────────────────────

function RiskBar({ label, value, color }: { label: string; value: number; color: string }) {
  const { palette } = useTheme();
  const barColor = value >= 75 ? palette.success : value >= 50 ? palette.warning : palette.danger;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: palette.textMuted }}>{label}</span>
        <span className="font-semibold" style={{ color: barColor }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: palette.surfaceAlt }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <div className="mb-6 rounded-2xl overflow-hidden" style={{ border: `1px solid ${palette.border}` }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{ backgroundColor: palette.surface, borderBottom: `1px solid ${palette.border}` }}>
        <Icon size={14} style={{ color: palette.primary }} />
        <h3 className="font-bold text-sm" style={{ color: palette.text }}>{title}</h3>
      </div>
      <div className="p-5" style={{ backgroundColor: palette.bg }}>{children}</div>
    </div>
  );
}

function ColGrid({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {children}
    </div>
  );
}

function CreatorCol({ campaign, color, children }: { campaign: Campaign; color: string; children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: palette.surface, border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold truncate" style={{ color: palette.text }}>{campaign.creator_name}</span>
      </div>
      {children}
    </div>
  );
}

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { palette } = useTheme();
  return (
    <div className="flex justify-between items-center py-1" style={{ borderBottom: `1px solid ${palette.border}22` }}>
      <span className="text-xs" style={{ color: palette.textMuted }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: highlight ? palette.success : palette.text }}>{value || '—'}</span>
    </div>
  );
}

function CompareView({ selected, campaigns, reports, loadingReports, onBack }: {
  selected: string[]; campaigns: Campaign[];
  reports: Record<string, FullReport | null>; loadingReports: boolean; onBack: () => void;
}) {
  const { palette } = useTheme();
  const creators = selected.map(id => campaigns.find(c => c.campaign_id === id)!).filter(Boolean);
  const n = creators.length;

  const scoreData = [{ name: 'AI Score', ...Object.fromEntries(creators.map(c => [c.creator_name, c.ai_score])) }];

  const forecastData = ['30 Days', '90 Days', '180 Days'].map((period, pi) => {
    const keys = ['30d', '90d', '180d'] as const;
    const row: Record<string, any> = { period };
    creators.forEach(c => {
      const base = reports[c.campaign_id]?.view_forecast_millions?.base_expected;
      if (base) row[c.creator_name] = base[keys[pi]] ?? 0;
    });
    return row;
  });
  const hasForecast = creators.some(c => reports[c.campaign_id]?.view_forecast_millions?.base_expected);

  const chartTooltipStyle = { backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 10 };

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">

        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 px-3 py-1.5 rounded-lg" style={{ color: palette.textMuted, backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
          <ChevronLeft size={14} /> Back to Creator Comparison
        </button>

        <h1 className="text-2xl font-bold mb-1" style={{ color: palette.text }}>AI Report Comparison</h1>
        <p className="text-sm mb-8" style={{ color: palette.textMuted }}>
          Side-by-side analysis of {n} creator{n > 1 ? 's' : ''} — brand partnership intelligence
          {loadingReports && <span className="ml-2 inline-flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Loading full reports…</span>}
        </p>

        {/* Identity cards */}
        <ColGrid count={n}>
          {creators.map((c, i) => {
            const r = reports[c.campaign_id];
            const report = r?.ai_underwriting_report;
            const rc = riskColor(c.risk_level, palette);
            const sc = c.ai_score >= 80 ? palette.success : c.ai_score >= 70 ? palette.warning : '#F97316';
            const thumb = report?.thumbnail_url || c.creator_thumbnail;
            return (
              <div key={c.campaign_id} className="rounded-2xl p-4 text-center" style={{ backgroundColor: palette.surface, border: `2px solid ${COLORS[i]}40` }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-3" style={{ border: `2px solid ${COLORS[i]}` }}>
                  {thumb
                    ? <img src={thumb} alt={c.creator_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl font-black" style={{ background: `${COLORS[i]}20`, color: COLORS[i] }}>{c.creator_name[0]}</div>}
                </div>
                <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: COLORS[i] }} />
                <h3 className="font-bold text-sm mb-0.5 truncate" style={{ color: palette.text }}>{report?.channel_name || c.creator_name}</h3>
                <p className="text-xs mb-1 truncate" style={{ color: palette.textMuted }}>{report?.handle || c.creator_handle}</p>
                {(report?.location || report?.niche) && (
                  <p className="text-xs mb-2" style={{ color: palette.textSubtle }}>{report.niche}{report.location ? ` · ${report.location}` : ''}</p>
                )}
                <div className="text-2xl font-black mb-0.5" style={{ color: sc }}>{c.ai_score}</div>
                <p className="text-xs mb-2" style={{ color: palette.textMuted }}>{report?.ai_score_label || 'AI Score'}</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rc}18`, color: rc }}>{c.risk_level} Risk</span>
                {report?.recent_performance && (
                  <p className="text-xs mt-2" style={{ color: palette.textSubtle }}>📹 {report.recent_performance}</p>
                )}
              </div>
            );
          })}
        </ColGrid>

        <div className="mt-6" />

        {/* Channel Metrics */}
        <Section title="Channel Metrics" icon={TrendingUp}>
          <ColGrid count={n}>
            {creators.map((c, i) => {
              const yt = reports[c.campaign_id]?.youtube_signals;
              return (
                <CreatorCol key={c.campaign_id} campaign={c} color={COLORS[i]}>
                  <MetricRow label="Subscribers" value={yt?.subscribers || c.subscribers} />
                  <MetricRow label="Avg Views" value={c.avg_views} />
                  <MetricRow label="Growth (30d)" value={yt?.growth_rate || c.growth_rate} highlight />
                  <MetricRow label="Engagement Rate" value={yt?.engagement_rate || '—'} />
                  <MetricRow label="Upload Cadence" value={yt?.cadence || '—'} />
                  <MetricRow label="Total Views" value={reports[c.campaign_id]?.ai_underwriting_report?.total_views || '—'} />
                  {yt?.p10_p50_p90_views && (
                    <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${palette.border}30` }}>
                      <p className="text-xs mb-1" style={{ color: palette.textSubtle }}>P10 / P50 / P90 Views</p>
                      <p className="text-xs font-bold" style={{ color: palette.text }}>
                        {yt.p10_p50_p90_views.p10} / {yt.p10_p50_p90_views.p50} / {yt.p10_p50_p90_views.p90}
                      </p>
                    </div>
                  )}
                </CreatorCol>
              );
            })}
          </ColGrid>
        </Section>

        {/* AI Score chart */}
        <Section title="AI Score Comparison" icon={Star}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreData} barGap={8} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke={`${palette.border}60`} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: palette.text }} />
              <Legend wrapperStyle={{ color: palette.textMuted, fontSize: 11, paddingTop: 8 }} />
              {creators.map((c, i) => <Bar key={c.campaign_id} dataKey={c.creator_name} fill={COLORS[i]} radius={[6, 6, 0, 0]} maxBarSize={60} />)}
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* View Forecast */}
        {hasForecast && (
          <Section title="View Forecast — Base Scenario (Millions)" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={forecastData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={`${palette.border}60`} vertical={false} />
                <XAxis dataKey="period" tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: palette.text }} formatter={(v: any) => [`${v}M views`, '']} />
                <Legend wrapperStyle={{ color: palette.textMuted, fontSize: 11, paddingTop: 8 }} />
                {creators.map((c, i) => {
                  const hasData = reports[c.campaign_id]?.view_forecast_millions?.base_expected;
                  return hasData ? <Bar key={c.campaign_id} dataKey={c.creator_name} fill={COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={48} /> : null;
                })}
              </BarChart>
            </ResponsiveContainer>
          </Section>
        )}

        {/* Revenue Scenarios */}
        {creators.some(c => reports[c.campaign_id]?.revenue_scenarios_adsense) && (
          <Section title="Revenue Scenarios (AdSense Estimate)" icon={DollarSign}>
            <ColGrid count={n}>
              {creators.map((c, i) => {
                const rev = reports[c.campaign_id]?.revenue_scenarios_adsense;
                return (
                  <CreatorCol key={c.campaign_id} campaign={c} color={COLORS[i]}>
                    {rev ? (
                      <>
                        {(['90d', '180d', '365d'] as const).map(term => (
                          <div key={term} className="mb-2">
                            <p className="text-xs font-semibold mb-0.5" style={{ color: palette.textSubtle }}>{term}</p>
                            <div className="flex justify-between text-xs">
                              <span style={{ color: palette.warning }}>Low: {rev[term]?.low?.estimated_revenue || '—'}</span>
                              <span style={{ color: palette.success }}>Base: {rev[term]?.base?.estimated_revenue || '—'}</span>
                              <span style={{ color: palette.primaryLight }}>High: {rev[term]?.high?.estimated_revenue || '—'}</span>
                            </div>
                          </div>
                        ))}
                        {rev.rpm_used && <p className="text-xs mt-1" style={{ color: palette.textSubtle }}>RPM: ${rev.rpm_used}/1K views</p>}
                      </>
                    ) : <p className="text-xs" style={{ color: palette.textSubtle }}>No revenue data</p>}
                  </CreatorCol>
                );
              })}
            </ColGrid>
          </Section>
        )}

        {/* Risk Factors */}
        {creators.some(c => reports[c.campaign_id]?.risk_factor_analysis) && (
          <Section title="Risk Factor Analysis" icon={Shield}>
            <ColGrid count={n}>
              {creators.map((c, i) => {
                const risk = reports[c.campaign_id]?.risk_factor_analysis;
                if (!risk) return (
                  <div key={c.campaign_id} className="rounded-xl p-4" style={{ backgroundColor: palette.surface }}>
                    <p className="text-xs text-center" style={{ color: palette.textSubtle }}>No report data</p>
                  </div>
                );
                return (
                  <CreatorCol key={c.campaign_id} campaign={c} color={COLORS[i]}>
                    <RiskBar label="Growth Trend" value={risk.growth_trend ?? 50} color={COLORS[i]} />
                    <RiskBar label="Cadence Reliability" value={risk.cadence_reliability ?? 50} color={COLORS[i]} />
                    <RiskBar label="Platform Diversification" value={risk.platform_diversification ?? 50} color={COLORS[i]} />
                    <RiskBar label="Low Volatility" value={risk.low_volatility_higher_is_better ?? 50} color={COLORS[i]} />
                    <RiskBar label="Low Concentration" value={risk.low_concentration_risk_higher_is_better ?? 50} color={COLORS[i]} />
                  </CreatorCol>
                );
              })}
            </ColGrid>
          </Section>
        )}

        {/* Social Signals */}
        {creators.some(c => reports[c.campaign_id]?.social_signals) && (
          <Section title="Social Signals" icon={Users}>
            <ColGrid count={n}>
              {creators.map((c, i) => {
                const soc = reports[c.campaign_id]?.social_signals;
                const topics = reports[c.campaign_id]?.trending_topics_analysis;
                return (
                  <CreatorCol key={c.campaign_id} campaign={c} color={COLORS[i]}>
                    {soc?.instagram && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-bold" style={{ color: '#E1306C' }}>IG</span>
                        <span className="text-xs" style={{ color: palette.text }}>{soc.instagram.followers} followers</span>
                        {soc.instagram.engagement_rate && <span className="text-xs" style={{ color: palette.textSubtle }}>· {soc.instagram.engagement_rate}</span>}
                      </div>
                    )}
                    {soc?.twitter_x && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-bold" style={{ color: '#1DA1F2' }}>𝕏</span>
                        <span className="text-xs" style={{ color: palette.text }}>{soc.twitter_x.followers} followers</span>
                      </div>
                    )}
                    {soc?.cross_platform_momentum && (
                      <p className="text-xs mb-1.5" style={{ color: palette.textMuted }}>{soc.cross_platform_momentum}</p>
                    )}
                    {soc?.no_controversy_flags != null && (
                      <p className="text-xs" style={{ color: soc.no_controversy_flags ? palette.success : palette.danger }}>
                        {soc.no_controversy_flags ? '✓ No controversy flags' : '⚠ Controversy signals detected'}
                      </p>
                    )}
                    {topics?.top_trending_topics && topics.top_trending_topics.length > 0 && (
                      <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${palette.border}30` }}>
                        <p className="text-xs mb-1" style={{ color: palette.textSubtle }}>Trending Topics</p>
                        <div className="flex flex-wrap gap-1">
                          {topics.top_trending_topics.slice(0, 4).map((t, ti) => (
                            <span key={ti} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${COLORS[i]}18`, color: COLORS[i] }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CreatorCol>
                );
              })}
            </ColGrid>
          </Section>
        )}

        {/* AI Assessment */}
        {creators.some(c => reports[c.campaign_id]?.ai_assessment_summary?.narrative) && (
          <Section title="AI Assessment" icon={Star}>
            <ColGrid count={n}>
              {creators.map((c, i) => {
                const a = reports[c.campaign_id]?.ai_assessment_summary;
                return (
                  <CreatorCol key={c.campaign_id} campaign={c} color={COLORS[i]}>
                    {a?.narrative && <p className="text-xs leading-relaxed mb-3" style={{ color: palette.textMuted }}>{a.narrative}</p>}
                    {a?.strengths && a.strengths.length > 0 && (
                      <div className="mb-2">
                        {a.strengths.slice(0, 3).map((s, si) => (
                          <div key={si} className="flex items-start gap-1 mb-1">
                            <span className="text-xs" style={{ color: palette.success }}>✓</span>
                            <span className="text-xs" style={{ color: palette.textMuted }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {a?.watch_factors && a.watch_factors.length > 0 && (
                      <div className="mb-2">
                        {a.watch_factors.slice(0, 2).map((w, wi) => (
                          <div key={wi} className="flex items-start gap-1 mb-1">
                            <span className="text-xs" style={{ color: palette.warning }}>⚠</span>
                            <span className="text-xs" style={{ color: palette.textMuted }}>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {a?.estimated_monthly_adsense_income && (
                      <div className="pt-2 mt-1" style={{ borderTop: `1px solid ${palette.border}` }}>
                        <p className="text-xs" style={{ color: palette.textSubtle }}>Est. Monthly Income</p>
                        <p className="text-sm font-bold" style={{ color: palette.success }}>{a.estimated_monthly_adsense_income}</p>
                      </div>
                    )}
                  </CreatorCol>
                );
              })}
            </ColGrid>
          </Section>
        )}

        {loadingReports && !hasForecast && !creators.some(c => reports[c.campaign_id]?.risk_factor_analysis) && (
          <div className="flex items-center justify-center gap-2 py-10" style={{ color: palette.textMuted }}>
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Fetching full AI reports…</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main CreatorComparison ─────────────────────────────────────────────────────

export function CreatorComparison() {
  const { palette } = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [reports, setReports] = useState<Record<string, FullReport | null>>({});
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    callApi<Campaign[]>('listLiveCampaigns_Marketplace')
      .then(res => setCampaigns((res.data ?? []).filter(c => !!c.analysis_id)))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const fetchReport = useCallback(async (campaign: Campaign) => {
    if (!campaign.analysis_id || reports[campaign.campaign_id] !== undefined) return;
    setLoadingReports(true);
    try {
      const res = await callApi<{ status: string; report: FullReport }>(
        'pollAnalysis_CreatorAnalysis',
        { pathParams: { analysis_id: campaign.analysis_id } }
      );
      setReports(prev => ({ ...prev, [campaign.campaign_id]: res.data?.status === 'completed' ? (res.data.report ?? null) : null }));
    } catch {
      setReports(prev => ({ ...prev, [campaign.campaign_id]: null }));
    } finally {
      setLoadingReports(false);
    }
  }, [reports]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_SELECT) return prev;
      const next = [...prev, id];
      const c = campaigns.find(x => x.campaign_id === id);
      if (c) fetchReport(c);
      return next;
    });
  }, [campaigns, fetchReport]);

  const filtered = useMemo(() =>
    campaigns
      .filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.creator_name.toLowerCase().includes(q) ||
          c.creator_handle.toLowerCase().includes(q) ||
          c.niche?.toLowerCase().includes(q) ||
          c.genres.some(g => g.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.ai_score - a.ai_score),
    [campaigns, searchQuery]
  );

  if (compareMode) {
    return <CompareView selected={selected} campaigns={campaigns} reports={reports} loadingReports={loadingReports} onBack={() => setCompareMode(false)} />;
  }

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10 pb-28">

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: palette.text }}>Creator Comparison</h1>
          <p className="text-sm" style={{ color: palette.textMuted }}>
            Select up to {MAX_SELECT} creators with AI reports to compare side by side for brand partnership decisions.
          </p>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: palette.textSubtle }} />
          <input
            type="text"
            placeholder="Search by creator name, handle, genre, or niche…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm outline-none"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}`, color: palette.text, fontSize: '1rem' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: palette.textSubtle }}>
              <X size={16} />
            </button>
          )}
        </div>

        {!loading && (
          <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
            <span style={{ color: palette.text }}>{filtered.length}</span> creator{filtered.length !== 1 ? 's' : ''} with AI reports
            {selected.length > 0 && <span style={{ color: palette.primary }}> · {selected.length} selected</span>}
            {selected.length === 0 && <span style={{ color: palette.textSubtle }}> — select up to {MAX_SELECT} to compare</span>}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20" style={{ color: palette.textMuted }}>
            <Loader2 size={18} className="animate-spin" /><span>Loading creators…</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(c => {
              const selIdx = selected.indexOf(c.campaign_id);
              const isSelected = selIdx >= 0;
              const color = isSelected ? COLORS[selIdx] : palette.primary;
              const isLoadingReport = isSelected && !!c.analysis_id && reports[c.campaign_id] === undefined;
              return (
                <CreatorCard
                  key={c.campaign_id}
                  item={c}
                  selected={isSelected}
                  onToggle={() => toggleSelect(c.campaign_id)}
                  color={color}
                  loadingReport={isLoadingReport}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold mb-2" style={{ color: palette.text }}>
              {campaigns.length === 0 ? 'No creators with AI reports yet' : 'No creators match your search'}
            </p>
            <p style={{ color: palette.textMuted }}>
              {campaigns.length === 0 ? 'Check back soon!' : 'Try a different name or genre'}
            </p>
          </div>
        )}
      </div>

      {/* Sticky compare bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-6 py-4" style={{ backgroundColor: `${palette.surface}f0`, borderTop: `1px solid ${palette.border}`, backdropFilter: 'blur(16px)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: palette.textMuted }}>Selected:</span>
              {selected.map((id, i) => {
                const c = campaigns.find(x => x.campaign_id === id);
                if (!c) return null;
                const hasReport = reports[id] !== undefined;
                return (
                  <div key={id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${COLORS[i]}20`, color: COLORS[i], border: `1px solid ${COLORS[i]}40` }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="max-w-[100px] truncate">{c.creator_name}</span>
                    {c.analysis_id && !hasReport && <Loader2 size={10} className="animate-spin" />}
                    {hasReport && <span title="Report loaded">✓</span>}
                    <button onClick={e => { e.stopPropagation(); toggleSelect(id); }}><X size={11} /></button>
                  </div>
                );
              })}
              {selected.length < MAX_SELECT && (
                <span className="text-xs" style={{ color: palette.textSubtle }}>+{MAX_SELECT - selected.length} more</span>
              )}
            </div>
            <button
              onClick={() => setCompareMode(true)}
              disabled={selected.length < 2}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm flex-shrink-0"
              style={{ background: selected.length >= 2 ? palette.gradient : palette.surfaceAlt, color: selected.length >= 2 ? palette.onPrimary : palette.textSubtle, opacity: selected.length < 2 ? 0.6 : 1, cursor: selected.length < 2 ? 'not-allowed' : 'pointer' }}
            >
              <GitCompare size={16} />
              Compare {selected.length >= 2 ? `${selected.length} Creators` : '(select 2+)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
