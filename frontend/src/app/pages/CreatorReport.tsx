import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import type { AnalysisChannel } from '../data/mockData';
import {
  Star, Shield, TrendingUp, AlertTriangle, ArrowRight, CheckCircle,
  Play, Zap, Users, RefreshCw,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ─── Score Gauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const { palette } = useTheme();
  const color = score >= 80 ? palette.success : score >= 65 ? palette.warning : palette.danger;
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
      <span className="text-sm font-bold mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${color}18`, color }}>
        {label}
      </span>
    </div>
  );
}

// ─── Risk Bar ─────────────────────────────────────────────────────────────────
function RiskBar({ label, value }: { label: string; value: number }) {
  const { palette } = useTheme();
  const color = value >= 80 ? palette.success : value >= 60 ? palette.warning : palette.danger;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: palette.textMuted }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}/100</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color, transition: 'width 1s ease' }}
        />
      </div>
    </div>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({ label, value }: { label: string; value: string }) {
  const { palette } = useTheme();
  return (
    <div className="text-center px-1">
      <p className="text-base font-black" style={{ color: palette.onPrimary }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: `${palette.onPrimary}99` }}>{label}</p>
    </div>
  );
}

// ─── Signal Row ───────────────────────────────────────────────────────────────
function SignalRow({ label, value }: { label: string; value: string }) {
  const { palette } = useTheme();
  return (
    <div className="flex items-start gap-1.5 mb-1.5">
      <CheckCircle size={10} className="mt-0.5 shrink-0" style={{ color: palette.success }} />
      <span className="text-xs leading-snug" style={{ color: palette.textMuted }}>
        <strong style={{ color: palette.text }}>{label}:</strong> {value}
      </span>
    </div>
  );
}

// ─── Revenue Scenario Card ────────────────────────────────────────────────────
function ScenarioCard({
  label, views, revenue, notes, accentColor,
}: { label: string; views: string; revenue: string; notes: string; accentColor: string }) {
  const { palette } = useTheme();
  return (
    <div
      className="p-3 rounded-xl mb-3"
      style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}28` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-sm" style={{ color: accentColor }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{notes}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-sm" style={{ color: palette.text }}>{views} views</p>
          <p className="text-xs" style={{ color: palette.textMuted }}>{revenue}</p>
        </div>
      </div>
    </div>
  );
}

interface LiveCampaignInfo {
  campaign_id: string;
  start_date: string | null;
  term_months: number;
  status: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CreatorReport() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [channel, setChannel] = useState<AnalysisChannel | null>(null);
  const [liveCampaign, setLiveCampaign] = useState<LiveCampaignInfo | null>(null);

  useEffect(() => {
    // Priority: sessionStorage (just analysed) → localStorage (returning user)
    const fromSession = sessionStorage.getItem('fanfolio_report');
    if (fromSession) {
      try { setChannel(JSON.parse(fromSession)); return; } catch { /* fall through */ }
    }
    if (user?.email) {
      const fromLocal = localStorage.getItem(`fanfolio_creator_report_${user.email}`);
      if (fromLocal) {
        try {
          const parsed = JSON.parse(fromLocal);
          sessionStorage.setItem('fanfolio_report', fromLocal);
          // Also restore analysis_id to sessionStorage
          const storedAnalysisId = localStorage.getItem(`fanfolio_analysis_id_${user.email}`);
          if (storedAnalysisId) {
            sessionStorage.setItem('fanfolio_analysis_id', storedAnalysisId);
          }
          setChannel(parsed);
          return;
        } catch { /* fall through */ }
      }
    }
    // No real report found — redirect to onboard so user runs analysis
    navigate('/onboard', { replace: true });
  }, [user, navigate]);

  // Check if creator already has a live campaign
  useEffect(() => {
    const analysisId =
      sessionStorage.getItem('fanfolio_analysis_id') ||
      (user?.email ? localStorage.getItem(`fanfolio_analysis_id_${user.email}`) : null);
    if (!analysisId) return;
    callApi<LiveCampaignInfo>('getCampaignByAnalysis_CreatorPage', { pathParams: { analysis_id: analysisId } })
      .then(res => setLiveCampaign(res.data))
      .catch(() => {});
  }, [user]);

  const handleReanalyze = () => {
    if (user?.email) {
      localStorage.removeItem(`fanfolio_creator_report_${user.email}`);
      localStorage.removeItem(`fanfolio_analysis_id_${user.email}`);
    }
    sessionStorage.removeItem('fanfolio_report');
    sessionStorage.removeItem('fanfolio_analysis_id');
    sessionStorage.removeItem('fanfolio_anim_done');
    navigate('/onboard');
  };

  if (!channel) return null;

  // Support both new field names and old backward-compat names
  const forecast = channel.view_forecast_millions ?? channel.view_forecast_millions_180_days ?? {};
  const revYpp = channel.revenue_scenarios_adsense ?? channel.revenue_scenarios_ypp ?? {};
  // New format: revenue_scenarios_adsense['180d'].low/base/high
  // Old format: revenue_scenarios_180_days_youtube_only.low_conservative/base_expected/high_optimistic
  const rev180 = revYpp['180d'] ?? {};
  const revOld = channel.revenue_scenarios_180_days_youtube_only ?? {};
  const revenue = {
    low_conservative:  rev180.low  ? { views: rev180.low.views,  estimated_adSense: rev180.low.estimated_revenue,  notes: 'Conservative: reduced cadence or algorithm dip' }  : (revOld.low_conservative  ?? {}),
    base_expected:     rev180.base ? { views: rev180.base.views, estimated_adSense: rev180.base.estimated_revenue, notes: 'Expected: current cadence and engagement maintained' } : (revOld.base_expected     ?? {}),
    high_optimistic:   rev180.high ? { views: rev180.high.views, estimated_adSense: rev180.high.estimated_revenue, notes: 'Optimistic: viral growth or new series launch' }        : (revOld.high_optimistic   ?? {}),
  };

  const { ai_underwriting_report: hdr, youtube_signals: yt, social_signals: social,
    trending_topics_analysis: topics, risk_factor_analysis: risk,
    ai_assessment_summary: assess, campaign_readiness: cta } = channel;

  const forecastChartData = [
    { period: '30d',  Low: forecast.low_conservative['30d'],  Base: forecast.base_expected['30d'],  High: forecast.high_optimistic['30d']  },
    { period: '90d',  Low: forecast.low_conservative['90d'],  Base: forecast.base_expected['90d'],  High: forecast.high_optimistic['90d']  },
    { period: '180d', Low: forecast.low_conservative['180d'], Base: forecast.base_expected['180d'], High: forecast.high_optimistic['180d'] },
  ];

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* ── Re-analyze bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: palette.textSubtle }}>Your last analysis result</p>
          <button
            onClick={handleReanalyze}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ backgroundColor: palette.surfaceAlt, color: palette.textMuted, border: `1px solid ${palette.border}` }}
          >
            <RefreshCw size={12} /> Run New Analysis
          </button>
        </div>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{ background: palette.gradient }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }} />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: `${palette.onPrimary}18`, color: palette.onPrimary }}
              >
                <Zap size={12} /> AI Underwriting Report
              </div>
              <h1 className="text-2xl font-black mb-0.5" style={{ color: palette.onPrimary }}>
                {hdr.channel_name}
              </h1>
              <p className="text-sm mb-1" style={{ color: `${palette.onPrimary}cc` }}>
                {hdr.handle} · {hdr.location}
              </p>
              <p className="text-xs mb-3" style={{ color: `${palette.onPrimary}99` }}>
                {hdr.niche}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <StatChip label="Subscribers" value={hdr.subscribers} />
                <StatChip label="Avg Views" value={hdr.avg_views} />
                <StatChip label="Total Views" value={hdr.total_views} />
                <StatChip label="Total Videos" value={hdr.total_videos} />
                <StatChip label="Growth (30d)" value={hdr.growth_rate} />
              </div>
              <p className="text-xs mt-3" style={{ color: `${palette.onPrimary}99` }}>
                📊 {hdr.recent_performance}
              </p>
            </div>
            <ScoreGauge score={hdr.ai_score} label={hdr.ai_score_label} />
          </div>
        </div>

        {/* ── Signal Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* YouTube Signals */}
          <div className="rounded-2xl p-4" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${palette.danger}18` }}>
                <Play size={14} style={{ color: palette.danger }} />
              </div>
              <span className="text-xs font-bold" style={{ color: palette.text }}>YouTube Signals</span>
            </div>
            <SignalRow label="Subscribers" value={yt.subscribers} />
            <SignalRow label="Total Views" value={yt.total_views} />
            <SignalRow label="Recent Videos" value={yt.recent_videos} />
            <SignalRow label="Growth" value={yt.growth_rate} />
            <SignalRow label="Cadence" value={yt.cadence} />
            <p className="text-xs mt-2 leading-snug" style={{ color: palette.textSubtle }}>{yt.notes}</p>
          </div>

          {/* Social Signals */}
          <div className="rounded-2xl p-4" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${palette.primary}18` }}>
                <Users size={14} style={{ color: palette.primary }} />
              </div>
              <span className="text-xs font-bold" style={{ color: palette.text }}>Social Signals</span>
            </div>
            {social.instagram && (
              <SignalRow label="Instagram" value={`${social.instagram.followers ?? '—'} followers · ${social.instagram.engagement_rate ?? '—'} eng.`} />
            )}
            {social.twitter_x && (
              <SignalRow label="X / Twitter" value={`${social.twitter_x.followers ?? social.twitter_x.handle ?? '—'} followers`} />
            )}
            {social.linkedin && (
              <SignalRow label="LinkedIn" value={social.linkedin.followers ? `${social.linkedin.followers} followers` : social.linkedin.url ?? '—'} />
            )}
            {!social.instagram && !social.twitter_x && !social.linkedin && (
              <p className="text-xs mb-2" style={{ color: palette.textSubtle }}>No social data — add handles for better signals</p>
            )}
            <div className="flex items-start gap-1.5 mt-2">
              <CheckCircle size={10} className="mt-0.5 shrink-0" style={{ color: social.no_controversy_flags ? palette.success : palette.warning }} />
              <span className="text-xs" style={{ color: palette.textMuted }}>No controversy flags</span>
            </div>
            <p className="text-xs mt-2 leading-snug" style={{ color: palette.textSubtle }}>{social.cross_platform_momentum}</p>
          </div>

          {/* Trending Topics */}
          <div className="rounded-2xl p-4" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${palette.accent}18` }}>
                <TrendingUp size={14} style={{ color: palette.accent }} />
              </div>
              <span className="text-xs font-bold" style={{ color: palette.text }}>Trending Topics</span>
            </div>
            {topics.top_trending_topics.map(t => (
              <div key={t} className="flex items-start gap-1.5 mb-1.5">
                <Star size={9} className="mt-0.5 shrink-0" style={{ color: palette.accent }} />
                <span className="text-xs leading-snug" style={{ color: palette.textMuted }}>{t}</span>
              </div>
            ))}
            <p className="text-xs mt-2 leading-snug" style={{ color: palette.textSubtle }}>{topics.momentum}</p>
          </div>
        </div>

        {/* ── Forecast + Revenue ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Chart */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <h3 className="font-bold mb-1" style={{ color: palette.text }}>View Forecast (Millions)</h3>
            <p className="text-xs mb-4" style={{ color: palette.textMuted }}>Low / Base / High — 30 · 90 · 180 day scenarios</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={forecastChartData} barGap={3} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke={`${palette.border}60`} vertical={false} />
                <XAxis dataKey="period" tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: palette.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, borderRadius: 10, color: palette.text }}
                  formatter={(v: any) => [`${v}M views`, '']}
                />
                <Bar dataKey="Low"  fill={palette.warning} radius={[3,3,0,0]} />
                <Bar dataKey="Base" fill={palette.primary} radius={[3,3,0,0]} />
                <Bar dataKey="High" fill={palette.success} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 justify-center">
              {[{ label: 'Conservative', color: palette.warning }, { label: 'Base', color: palette.primary }, { label: 'Optimistic', color: palette.success }].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs" style={{ color: palette.textMuted }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              {[
                { label: '🔴 Conservative', note: forecast.low_conservative.notes },
                { label: '🔵 Base', note: forecast.base_expected.notes },
                { label: '🟢 Optimistic', note: forecast.high_optimistic.notes },
              ].map(n => (
                <p key={n.label} className="text-xs" style={{ color: palette.textSubtle }}>
                  <strong>{n.label}:</strong> {n.note}
                </p>
              ))}
            </div>
          </div>

          {/* Revenue Scenarios */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <h3 className="font-bold mb-1" style={{ color: palette.text }}>Revenue Scenarios (180 Days)</h3>
            <p className="text-xs mb-4" style={{ color: palette.textMuted }}>AdSense income · est. monthly: {assess.estimated_monthly_adsense_income ?? assess.estimated_monthly_ypp_income ?? assess.youtube_only_adSense_monthly}</p>
            <ScenarioCard label="Conservative" views={revenue.low_conservative.views} revenue={revenue.low_conservative.estimated_adSense} notes={revenue.low_conservative.notes} accentColor={palette.warning} />
            <ScenarioCard label="Base Expected" views={revenue.base_expected.views} revenue={revenue.base_expected.estimated_adSense} notes={revenue.base_expected.notes} accentColor={palette.primary} />
            <ScenarioCard label="Optimistic" views={revenue.high_optimistic.views} revenue={revenue.high_optimistic.estimated_adSense} notes={revenue.high_optimistic.notes} accentColor={palette.success} />
          </div>
        </div>

        {/* ── Risk + Assessment ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Risk Factors */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <h3 className="font-bold mb-4" style={{ color: palette.text }}>Risk Factor Analysis</h3>
            <RiskBar label="Growth Trend" value={risk.growth_trend} />
            <RiskBar label="Cadence Reliability" value={risk.cadence_reliability} />
            <RiskBar label="Platform Diversification" value={risk.platform_diversification} />
            <RiskBar label="Low Volatility (higher = better)" value={risk.low_volatility_higher_is_better} />
            <RiskBar label="Low Concentration Risk (higher = better)" value={risk.low_concentration_risk_higher_is_better} />
          </div>

          {/* AI Assessment */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <h3 className="font-bold mb-4" style={{ color: palette.text }}>AI Assessment Summary</h3>

            <div className="p-3 rounded-xl mb-3 flex items-start gap-2" style={{ backgroundColor: `${palette.success}12`, border: `1px solid ${palette.success}25` }}>
              <Shield size={14} className="mt-0.5 shrink-0" style={{ color: palette.success }} />
              <div>
                <p className="text-xs font-bold mb-1.5" style={{ color: palette.success }}>Strengths</p>
                <ul className="text-xs space-y-1" style={{ color: palette.textMuted }}>
                  {assess.strengths.map(s => <li key={s}>• {s}</li>)}
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-xl mb-3 flex items-start gap-2" style={{ backgroundColor: `${palette.warning}10`, border: `1px solid ${palette.warning}25` }}>
              <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: palette.warning }} />
              <div>
                <p className="text-xs font-bold mb-1.5" style={{ color: palette.warning }}>Watch Factors</p>
                <ul className="text-xs space-y-1" style={{ color: palette.textMuted }}>
                  {assess.watch_factors.map(w => <li key={w}>• {w}</li>)}
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs" style={{ color: palette.textSubtle }}>Confidence Score</p>
                <span className="text-sm font-black" style={{ color: palette.success }}>{assess.confidence_score}/100</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.bg }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${assess.confidence_score}%`, backgroundColor: palette.success }} />
              </div>
              <p className="text-xs mt-1.5" style={{ color: palette.textSubtle }}>Based on {assess.confidence_based_on}</p>
            </div>
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        {liveCampaign ? (
          // Already has a live campaign — show status + next campaign info
          (() => {
            const startDate = liveCampaign.start_date ? new Date(liveCampaign.start_date) : new Date();
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + liveCampaign.term_months);
            const nextCampaignEligible = new Date(endDate);
            nextCampaignEligible.setMonth(nextCampaignEligible.getMonth() - 1);
            const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const now = new Date();
            const canSetupNow = now >= nextCampaignEligible;
            return (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
              >
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3"
                  style={{ backgroundColor: `${palette.success}18`, color: palette.success }}
                >
                  <Zap size={11} /> Campaign Live · Season 1
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: palette.text }}>
                  Your campaign is currently live!
                </h3>
                <p className="text-sm mb-2" style={{ color: palette.textMuted }}>
                  Current campaign runs until <strong style={{ color: palette.text }}>{fmt(endDate)}</strong>.
                </p>
                <p className="text-xs mb-5 px-4" style={{ color: palette.textSubtle }}>
                  You can set up your next campaign (Season 2) from <strong style={{ color: palette.text }}>{fmt(nextCampaignEligible)}</strong> — one month before this campaign ends.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate('/campaign-live')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                    style={{ background: palette.gradient, color: palette.onPrimary }}
                  >
                    View Live Campaign <ArrowRight size={15} />
                  </button>
                  {canSetupNow && (
                    <button
                      onClick={() => navigate('/campaign-setup')}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                      style={{ backgroundColor: `${palette.primary}15`, color: palette.primary, border: `1px solid ${palette.primary}30` }}
                    >
                      Set Up Season 2
                    </button>
                  )}
                </div>
              </div>
            );
          })()
        ) : (
          // No campaign yet — show standard setup CTA
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <div
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: `${palette.success}18`, color: palette.success }}
            >
              <Zap size={11} /> Campaign Ready · {cta.overall_score}
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: palette.text }}>
              Ready to create your campaign?
            </h3>
            <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
              {cta.message}
            </p>
            <button
              onClick={() => navigate('/campaign-setup')}
              className="flex items-center justify-center gap-2 mx-auto px-8 py-3 rounded-xl font-bold text-sm"
              style={{ background: palette.gradient, color: palette.onPrimary }}
            >
              Set Up Campaign <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION V: EXTENDED ANALYSIS (NEW)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
          <h2 className="text-2xl font-black mb-6" style={{ color: palette.text }}>
            📊 Extended Analysis
          </h2>

          {/* Content Performance Breakdown */}
          {ch.content_performance_breakdown?.analyzed && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
                <Play size={18} style={{ color: palette.primary }} />
                Content Performance Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${palette.border}` }}>
                      <th className="text-left py-2 px-3 font-bold" style={{ color: palette.textMuted }}>Topic/Series</th>
                      <th className="text-left py-2 px-3 font-bold" style={{ color: palette.textMuted }}>Avg Views</th>
                      <th className="text-left py-2 px-3 font-bold" style={{ color: palette.textMuted }}>CPM</th>
                      <th className="text-left py-2 px-3 font-bold" style={{ color: palette.textMuted }}>Performance</th>
                      <th className="text-left py-2 px-3 font-bold" style={{ color: palette.textMuted }}>Revenue Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ch.content_performance_breakdown.topics.map((topic: any, i: number) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${palette.border}20` }}>
                        <td className="py-3 px-3" style={{ color: palette.text }}>{topic.topic_series}</td>
                        <td className="py-3 px-3 font-bold" style={{ color: palette.primary }}>{topic.avg_views}</td>
                        <td className="py-3 px-3" style={{ color: palette.textMuted }}>{topic.cpm_estimate}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 rounded text-xs font-bold" style={{
                            backgroundColor: topic.performance_rating === 'Excellent' ? `${palette.success}18` : `${palette.primary}18`,
                            color: topic.performance_rating === 'Excellent' ? palette.success : palette.primary
                          }}>
                            {topic.performance_rating}
                          </span>
                        </td>
                        <td className="py-3 px-3" style={{ color: palette.textMuted }}>{topic.revenue_contribution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-3" style={{ color: palette.textSubtle }}>
                {ch.content_performance_breakdown.notes}
              </p>
            </div>
          )}

          {/* Audience Insights */}
          {ch.audience_insights && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
                <Users size={18} style={{ color: palette.primary }} />
                Audience Insights
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Geographic Distribution */}
                <div className="p-4 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
                  <h4 className="text-sm font-bold mb-3" style={{ color: palette.text }}>Geographic Distribution</h4>
                  {ch.audience_insights.geographic_distribution.map((country: any, i: number) => (
                    <div key={i} className="flex items-center justify-between mb-2">
                      <span className="text-sm flex items-center gap-2" style={{ color: palette.textMuted }}>
                        <span className="text-lg">{country.flag}</span>
                        {country.country}
                      </span>
                      <span className="font-bold text-sm" style={{ color: palette.text }}>{country.percentage}%</span>
                    </div>
                  ))}
                </div>

                {/* Demographics */}
                <div className="p-4 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
                  <h4 className="text-sm font-bold mb-3" style={{ color: palette.text }}>Demographics</h4>
                  <div className="mb-3">
                    <p className="text-xs font-bold mb-2" style={{ color: palette.textMuted }}>Age Distribution</p>
                    {ch.audience_insights.demographics.age_ranges.slice(0, 3).map((range: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs mb-1" style={{ color: palette.textMuted }}>
                        <span>{range.range}</span>
                        <span className="font-bold" style={{ color: palette.text }}>{range.percentage}%</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: palette.textMuted }}>Gender Split</p>
                    <div className="flex gap-2">
                      <div className="flex-1 text-center py-1 rounded text-xs font-bold" style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}>
                        M: {ch.audience_insights.demographics.gender_split.male}%
                      </div>
                      <div className="flex-1 text-center py-1 rounded text-xs font-bold" style={{ backgroundColor: `${palette.accent}18`, color: palette.accent }}>
                        F: {ch.audience_insights.demographics.gender_split.female}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
                <h4 className="text-sm font-bold mb-3" style={{ color: palette.text }}>Engagement Patterns</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs" style={{ color: palette.textSubtle }}>Peak Hours (UTC)</p>
                    <p className="text-sm font-bold mt-1" style={{ color: palette.text }}>
                      {ch.audience_insights.engagement_patterns.peak_hours_utc.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: palette.textSubtle }}>Avg Watch Time</p>
                    <p className="text-sm font-bold mt-1" style={{ color: palette.text }}>
                      {ch.audience_insights.engagement_patterns.avg_watch_time_minutes} min
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: palette.textSubtle }}>CTR</p>
                    <p className="text-sm font-bold mt-1" style={{ color: palette.success }}>
                      {ch.audience_insights.engagement_patterns.click_through_rate_pct}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: palette.textSubtle }}>Blended CPM</p>
                    <p className="text-sm font-bold mt-1" style={{ color: palette.primary }}>
                      {ch.audience_insights.blended_cpm_usd}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Competitor Analysis */}
          {ch.competitor_analysis && ch.competitor_analysis.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
                <Shield size={18} style={{ color: palette.primary }} />
                Competitor Analysis
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {ch.competitor_analysis.map((comp: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}>
                    <h4 className="font-bold mb-2" style={{ color: palette.text }}>{comp.name}</h4>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: palette.textMuted }}>Subscribers</span>
                        <span className="font-bold" style={{ color: palette.text }}>{comp.subscribers}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: palette.textMuted }}>Avg Views</span>
                        <span className="font-bold" style={{ color: palette.text }}>{comp.avg_views}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: palette.textMuted }}>Growth</span>
                        <span className="font-bold" style={{ color: palette.success }}>{comp.growth_rate}</span>
                      </div>
                    </div>
                    <p className="text-xs mb-2" style={{ color: palette.textMuted }}>
                      <strong style={{ color: palette.text }}>Strategy:</strong> {comp.content_strategy}
                    </p>
                    <p className="text-xs" style={{ color: palette.textSubtle }}>
                      {comp.positioning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION VI: GROWTH STRATEGY (NEW)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
          <h2 className="text-2xl font-black mb-6" style={{ color: palette.text }}>
            🚀 Growth Strategy
          </h2>

          {/* Next 10 Video Ideas */}
          {ch.video_recommendations && ch.video_recommendations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
                <Zap size={18} style={{ color: palette.primary }} />
                Next 10 Video Ideas (High Revenue Potential)
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {ch.video_recommendations.map((video: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold flex-1" style={{ color: palette.text }}>{video.title}</h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0" style={{
                        backgroundColor: video.revenue_potential === 'Very High' ? `${palette.success}18` : `${palette.primary}18`,
                        color: video.revenue_potential === 'Very High' ? palette.success : palette.primary
                      }}>
                        {video.revenue_potential}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: palette.textMuted }}>
                      <span>CPM: <strong style={{ color: palette.primary }}>{video.estimated_cpm}</strong></span>
                      <span>•</span>
                      <span>{video.reasoning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Diversification */}
          {ch.revenue_diversification && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
                <TrendingUp size={18} style={{ color: palette.primary }} />
                Revenue Diversification Roadmap
              </h3>
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: `${palette.success}10`, border: `1px solid ${palette.success}30` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold" style={{ color: palette.textMuted }}>Current Monthly (AdSense)</p>
                    <p className="text-2xl font-black mt-1" style={{ color: palette.success }}>
                      {ch.revenue_diversification.current_revenue_streams.adsense.monthly_estimate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: palette.textMuted }}>Total Potential Monthly</p>
                    <p className="text-2xl font-black mt-1" style={{ color: palette.primary }}>
                      {ch.revenue_diversification.total_potential_monthly}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                {ch.revenue_diversification.potential_revenue_streams.map((stream: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}>
                    <h4 className="font-bold text-sm mb-2" style={{ color: palette.text }}>{stream.stream}</h4>
                    <p className="text-lg font-black mb-2" style={{ color: palette.primary }}>{stream.monthly_potential}/mo</p>
                    <div className="space-y-1 text-xs" style={{ color: palette.textMuted }}>
                      <p><strong style={{ color: palette.text }}>Difficulty:</strong> {stream.setup_difficulty}</p>
                      <p><strong style={{ color: palette.text }}>Timeline:</strong> {stream.time_to_launch}</p>
                      <p className="mt-2" style={{ color: palette.textSubtle }}>{stream.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: `${palette.warning}10`, color: palette.textMuted }}>
                <strong style={{ color: palette.warning }}>Recommendation:</strong> {ch.revenue_diversification.recommendation}
              </p>
            </div>
          )}

          {/* Growth Action Plan */}
          {ch.growth_action_plan && ch.growth_action_plan.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
                <RefreshCw size={18} style={{ color: palette.primary }} />
                30-Day Growth Action Plan
              </h3>
              <div className="space-y-3">
                {ch.growth_action_plan.map((action: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm" style={{
                        backgroundColor: action.impact === 'Very High' ? `${palette.success}28` : action.impact === 'High' ? `${palette.primary}28` : `${palette.warning}28`,
                        color: action.impact === 'Very High' ? palette.success : action.impact === 'High' ? palette.primary : palette.warning
                      }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-sm" style={{ color: palette.text }}>{action.action}</h4>
                          <div className="flex gap-2 shrink-0">
                            <span className="text-xs px-2 py-0.5 rounded font-bold" style={{
                              backgroundColor: `${palette.primary}18`,
                              color: palette.primary
                            }}>
                              {action.impact} Impact
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded" style={{
                              backgroundColor: palette.surfaceAlt,
                              color: palette.textMuted
                            }}>
                              {action.timeline}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: palette.textMuted }}>{action.rationale}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
