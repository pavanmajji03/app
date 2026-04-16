import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import { getStoredReport } from '../utils/reportUtils';
import type { Creator, TermOption } from '../data/mockData';
import {
  Clock, DollarSign, Users, TrendingUp, Eye,
  Info, Zap, ChevronLeft, ChevronRight, CalendarDays, Lock, Loader2,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────
function parseAdSense(s: string): number {
  return Number(s.replace(/[$,]/g, ''));
}

function getDefaultStartDate(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Month+Year Picker (campaigns always start on the 1st) ───────────────────
function MonthYearPicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const { palette } = useTheme();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const minYear = today.getFullYear();
  const minMonth = today.getMonth() + 1; // next month minimum

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDisabled = (month: number) =>
    viewYear < minYear || (viewYear === minYear && month <= minMonth - 1);

  const isSelected = (month: number) =>
    value.getFullYear() === viewYear && value.getMonth() === month;

  const select = (month: number) => {
    if (isDisabled(month)) return;
    onChange(new Date(viewYear, month, 1));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setViewYear(value.getFullYear()); }}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
        style={{
          backgroundColor: palette.surfaceAlt,
          border: `1.5px solid ${open ? palette.primary : palette.border}`,
          color: palette.text,
          outline: 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={15} style={{ color: palette.primary }} />
          <span>1 {formatMonthYear(value)}</span>
        </div>
        <ChevronRight size={14} style={{ color: palette.textMuted, transform: open ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50 rounded-2xl p-4 w-full"
          style={{ backgroundColor: palette.surface, border: `1.5px solid ${palette.border}`, boxShadow: `0 12px 40px ${palette.bg}cc`, minWidth: 260 }}
        >
          {/* Year nav */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setViewYear(y => y - 1)} disabled={viewYear <= minYear}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: viewYear > minYear ? `${palette.primary}18` : 'transparent', color: viewYear > minYear ? palette.primary : palette.textSubtle, cursor: viewYear > minYear ? 'pointer' : 'not-allowed' }}>
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-bold" style={{ color: palette.text }}>{viewYear}</span>
            <button type="button" onClick={() => setViewYear(y => y + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${palette.primary}18`, color: palette.primary, cursor: 'pointer' }}>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS_SHORT.map((m, i) => {
              const disabled = isDisabled(i);
              const selected = isSelected(i);
              return (
                <button key={m} type="button" onClick={() => select(i)} disabled={disabled}
                  className="py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selected ? palette.primary : `${palette.primary}10`,
                    color: selected ? palette.onPrimary : disabled ? palette.textSubtle : palette.text,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                  }}>
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Preview Card ─────────────────────────────────────────────────────────────
function PreviewCard({
  creator, term, revenueShare, targetAmount, returnLow, returnBase, returnHigh,
}: {
  creator: Creator; term: number; revenueShare: number; targetAmount: number;
  returnLow: string; returnBase: string; returnHigh: string;
}) {
  const { palette } = useTheme();
  const baseReturn = returnBase;
  const lowReturn  = returnLow;
  const highReturn = returnHigh;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${palette.primary}` }}>
      <div
        className="px-4 py-2 text-xs font-bold tracking-wider text-center"
        style={{ background: palette.gradient, color: palette.onPrimary }}
      >
        CAMPAIGN PREVIEW
      </div>
      <div className="p-4" style={{ backgroundColor: palette.surface }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ border: `2px solid ${palette.primary}` }}>
            <img src={creator.image} alt={creator.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: palette.text }}>{creator.name}</p>
            <p className="text-xs" style={{ color: palette.textMuted }}>{creator.handle}</p>
          </div>
          <div
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ backgroundColor: `${palette.success}18`, color: palette.success }}
          >
            AI Score {creator.aiScore}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
          <div className="text-center">
            <p className="text-xs font-bold" style={{ color: palette.text }}>{term} mo</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Term</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold" style={{ color: palette.text }}>{revenueShare}%</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Rev Share</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold" style={{ color: palette.success }}>+{highReturn}%</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Upside</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: palette.textMuted }}>Raise Target</span>
            <span style={{ color: palette.text }}>${targetAmount.toLocaleString()}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
            <div className="h-full rounded-full w-0" style={{ background: palette.gradient }} />
          </div>
          <p className="text-xs mt-1" style={{ color: palette.textSubtle }}>Campaign preview · not yet live</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Low',  value: Number(lowReturn),  color: palette.warning },
            { label: 'Base', value: Number(baseReturn), color: palette.success },
            { label: 'High', value: Number(highReturn), color: palette.primaryLight },
          ].map(s => {
            const formatted = s.value === 0 ? '0%' : s.value > 0 ? `+${s.value.toFixed(1)}%` : `${s.value.toFixed(1)}%`;
            return (
            <div key={s.label} className="p-2 rounded-lg" style={{ backgroundColor: palette.surfaceAlt }}>
              <p className="font-bold text-sm" style={{ color: s.color }}>{formatted}</p>
              <p className="text-xs" style={{ color: palette.textSubtle }}>{s.label}</p>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Map campaign term months → forecast period key
function termToKey(months: number): '90d' | '180d' | '365d' {
  if (months <= 3) return '90d';
  if (months <= 6) return '180d';
  return '365d';
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CampaignSetup() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [termOptions, setTermOptions] = useState<TermOption[]>([]);
  const [stored, setStored] = useState<ReturnType<typeof getStoredReport>>(null);
  const [selectedTerm, setSelectedTerm] = useState(6);
  const [revenueShare, setRevenueShare] = useState(10);
  const [startDate, setStartDate] = useState<Date>(getDefaultStartDate());
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    callApi<TermOption[]>('getTermOptions_CampaignSetup').then(res => {
      setTermOptions(res.data);
      const popular = res.data.find(t => t.popular);
      if (popular) setSelectedTerm(popular.months);
    });

    const report = getStoredReport(user?.email);
    if (report) {
      setStored(report);
      setCreator({
        name: report.channelName,
        handle: report.handle,
        image: report.thumbnailUrl ?? '',
        aiScore: report.aiScore,
        subscribers: report.subscribers,
        avgViews: report.avgViews,
        growthRate: report.growthRate,
        niche: report.niche,
        returnBase: 9,
        returnLow: 6,
        returnHigh: 14,
        riskLevel: report.aiScore >= 80 ? 'Low' : report.aiScore >= 65 ? 'Medium' : 'High',
      } as Creator);
    } else {
      navigate('/onboard', { replace: true });
    }
  }, [user, navigate]);

  if (!creator || !stored) return null;

  // ── Term-aware revenue ──────────────────────────────────────────────────────
  const termKey = termToKey(selectedTerm);
  const scenarios = stored.revenueScenarios?.[termKey];

  // Parse revenue string "$12,400" → 12400, fall back to baseAdSenseStr
  const parseRev = (s: string | undefined) => parseAdSense(s ?? stored.baseAdSenseStr ?? '$0');
  const baseRevenue  = parseRev(scenarios?.base);
  const lowRevenue   = parseRev(scenarios?.low);
  const highRevenue  = parseRev(scenarios?.high);

  // Raise target = base expected revenue × revenue share %
  // This is the pool fans invest into. Creator gets this upfront.
  // Fans are paid back from actual YouTube revenue over the term.
  const targetAmount = Math.round(baseRevenue * (revenueShare / 100));

  // Fan return = (actual_payout / investment - 1) × 100
  // At base → 0% (get money back exactly)
  // At high → positive return (creator outperforms)
  // At low  → negative return (creator underperforms)
  const calcReturn = (revenue: number) =>
    targetAmount > 0 ? ((revenue * (revenueShare / 100) / targetAmount) - 1) * 100 : 0;

  const fanReturnBase = calcReturn(baseRevenue).toFixed(1);
  const fanReturnLow  = calcReturn(lowRevenue).toFixed(1);
  const fanReturnHigh = calcReturn(highRevenue).toFixed(1);

  // View forecast for selected term
  const forecastBase = stored.forecastBaseM;
  const forecastLow  = stored.forecastLowM;
  const forecastHigh = stored.forecastHighM;
  const viewsForTerm = (f: typeof forecastBase) =>
    termKey === '90d' ? f.d90 : termKey === '180d' ? f.d180 : f.d365;

  const estimatedFanReturn = fanReturnBase;

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError(null);
    const analysisId = sessionStorage.getItem('fanfolio_analysis_id');
    if (!analysisId) {
      setPublishError('No analysis found. Please run an analysis first.');
      setPublishing(false);
      return;
    }
    try {
      const res = await callApi<{ campaign_id: string }>(
        'createCampaign_CampaignSetup',
        {
          payload: {
            analysis_id: analysisId,
            term_months: selectedTerm,
            revenue_share_pct: revenueShare,
            target_amount: targetAmount,
            start_date: startDate.toISOString().split('T')[0],
            return_low: Number(fanReturnLow) || 0,
            return_base: Number(fanReturnBase) || 0,
            return_high: Number(fanReturnHigh) || 0,
          },
        }
      );
      sessionStorage.setItem('fanfolio_campaign_id', res.data.campaign_id);
      // Persist so returning creators go straight to campaign-live on next login
      if (user?.email) {
        localStorage.setItem(`fanfolio_campaign_id_${user.email}`, res.data.campaign_id);
      }
      navigate('/campaign-live');
    } catch {
      setPublishError('Could not publish campaign. Please try again.');
      setPublishing(false);
    }
  };

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
          >
            <Zap size={12} /> AI Score {creator.aiScore}/100 · Ready to list
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: palette.text }}>Set Campaign Terms</h1>
          <p style={{ color: palette.textMuted }}>
            Configure your campaign terms. Fans will see a projected payout range based on your AI forecast.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left: Config ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Campaign Term */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} style={{ color: palette.primary }} />
                <h3 className="font-bold" style={{ color: palette.text }}>Campaign Term</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {termOptions.map(opt => (
                  <button
                    key={opt.months}
                    onClick={() => setSelectedTerm(opt.months)}
                    className="relative p-3 rounded-xl text-left transition-all"
                    style={{
                      backgroundColor: selectedTerm === opt.months ? `${palette.primary}18` : palette.surfaceAlt,
                      border: `2px solid ${selectedTerm === opt.months ? palette.primary : 'transparent'}`,
                    }}
                  >
                    {opt.popular && (
                      <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: palette.accentGradient, color: palette.onAccent, fontSize: '9px', fontWeight: 700 }}
                      >
                        POPULAR
                      </div>
                    )}
                    <p
                      className="font-bold text-sm mb-0.5"
                      style={{ color: selectedTerm === opt.months ? palette.primary : palette.text }}
                    >
                      {opt.label}
                    </p>
                    <p className="text-xs" style={{ color: palette.textSubtle }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue Share */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} style={{ color: palette.primary }} />
                  <h3 className="font-bold" style={{ color: palette.text }}>Revenue Share</h3>
                </div>
                <div
                  className="text-lg font-black px-3 py-1 rounded-xl"
                  style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
                >
                  {revenueShare}%
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={revenueShare}
                onChange={e => setRevenueShare(Number(e.target.value))}
                className="w-full mb-3"
                style={{ accentColor: palette.primary }}
              />
              <div className="flex justify-between text-xs" style={{ color: palette.textSubtle }}>
                <span>1% (minimal)</span>
                <span>10% (balanced)</span>
                <span>20% (max)</span>
              </div>
              <div
                className="mt-4 p-3 rounded-xl flex items-start gap-2"
                style={{ backgroundColor: `${palette.primary}10`, border: `1px solid ${palette.primary}20` }}
              >
                <Info size={13} style={{ color: palette.primary, marginTop: 1 }} />
                <p className="text-xs" style={{ color: palette.primary }}>
                  At <strong>{revenueShare}%</strong> revenue share, fans back you upfront and receive{' '}
                  <strong>{revenueShare}% of your actual YouTube revenue</strong> over {selectedTerm} months.
                  If you hit the base forecast, fans break even. Outperform → fans profit. Underperform → fans get less back.
                </p>
              </div>
            </div>

            {/* Raise Target — computed & locked */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users size={16} style={{ color: palette.primary }} />
                  <h3 className="font-bold" style={{ color: palette.text }}>Raise Target</h3>
                </div>
                <div
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${palette.primary}12`, color: palette.textMuted }}
                >
                  <Lock size={10} /> Auto-calculated
                </div>
              </div>
              <p className="text-xs mb-3" style={{ color: palette.textSubtle }}>
                Based on {selectedTerm}-month base AdSense estimate ({scenarios?.base ?? stored.baseAdSenseStr}) × {revenueShare}% revenue share
              </p>
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: `${palette.primary}08`,
                  border: `1.5px solid ${palette.primary}30`,
                }}
              >
                <span className="text-lg font-black" style={{ color: palette.primary }}>$</span>
                <span className="text-xl font-black" style={{ color: palette.text }}>
                  {targetAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Campaign Start Date */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays size={16} style={{ color: palette.primary }} />
                <h3 className="font-bold" style={{ color: palette.text }}>Campaign Start Date</h3>
              </div>
              <p className="text-xs mb-3" style={{ color: palette.textSubtle }}>
                Campaigns launch on the 1st of the selected month. Earliest: next month.
              </p>
              <MonthYearPicker value={startDate} onChange={setStartDate} />
            </div>

            {/* Campaign Summary */}
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
            >
              <h4 className="text-xs font-semibold mb-3" style={{ color: palette.textMuted }}>Campaign Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Term',          value: `${selectedTerm} months` },
                  { label: 'Revenue Share', value: `${revenueShare}%` },
                  { label: 'Raise Target',  value: `$${targetAmount.toLocaleString()}` },
                  { label: 'Upside (High)', value: Number(fanReturnHigh) > 0 ? `+${fanReturnHigh}%` : `${fanReturnHigh}%` },
                  { label: 'Start Date',    value: `1 ${formatMonthYear(startDate)}` },
                  { label: 'Your AI Score', value: `${creator.aiScore} / 100` },
                  { label: 'Risk Rating',   value: creator.riskLevel },
                ].map(item => (
                  <div key={item.label} className="flex justify-between col-span-1">
                    <span style={{ color: palette.textSubtle }}>{item.label}</span>
                    <span style={{ color: palette.text }} className="font-medium text-right ml-2">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How Escrow Works */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <h4 className="font-bold mb-1 text-sm" style={{ color: palette.text }}>How Payouts Work</h4>
              <p className="text-xs mb-4" style={{ color: palette.textMuted }}>
                FanZFolio uses an escrow model — your AdSense revenue flows through us so payouts to fans are automatic, transparent, and verified.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { step: '1', label: 'You link AdSense to escrow', desc: 'You redirect your YouTube AdSense payout to FanZFolio\'s escrow account. Takes 5 minutes via Google settings.' },
                  { step: '2', label: 'YouTube pays escrow', desc: 'Every month, YouTube deposits your revenue directly into the escrow — not your personal account.' },
                  { step: '3', label: 'We distribute to fans', desc: `FanZFolio automatically sends ${revenueShare}% to your backers on the 10th of each month.` },
                  { step: '4', label: 'You get the rest in 1–2 days', desc: 'The remaining balance is transferred to your linked bank account within 1–2 business days.' },
                ].map(item => (
                  <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${palette.primary}20`, color: palette.primary }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: palette.text }}>{item.label}</p>
                      <p className="text-xs leading-relaxed" style={{ color: palette.textMuted }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <h4 className="font-bold mb-3 text-sm" style={{ color: palette.text }}>Terms & Conditions</h4>

              <div className="flex flex-col gap-3 mb-4">
                {[
                  {
                    icon: '💸',
                    text: `I agree to share ${revenueShare}% of my actual YouTube revenue every month with fans who back this campaign, for the full ${selectedTerm}-month term.`,
                  },
                  {
                    icon: '🏦',
                    text: 'I agree to link my YouTube AdSense account to FanZFolio\'s escrow account. YouTube will pay my revenue into the escrow, FanZFolio will distribute the fan payouts, and the remaining balance will be transferred to my bank account within 1–2 business days.',
                  },
                  {
                    icon: '⚠️',
                    text: 'I understand that failing to make timely repayments will result in a black mark on my creator profile, legal action, and will negatively reflect in all future AI underwriting reports on FanZFolio.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
                    <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-xs leading-relaxed" style={{ color: palette.textMuted }}>{item.text}</p>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 flex-shrink-0"
                  style={{ accentColor: palette.primary, width: 16, height: 16 }}
                />
                <span className="text-xs leading-relaxed" style={{ color: palette.text }}>
                  I have read and agree to all the above terms. I understand my obligations as a campaign creator on FanZFolio.
                </span>
              </label>
            </div>

            {publishError && (
              <p className="text-xs text-center" style={{ color: palette.danger }}>{publishError}</p>
            )}
            <button
              onClick={handlePublish}
              disabled={publishing || !termsAccepted}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: palette.gradient, color: palette.onPrimary, opacity: (publishing || !termsAccepted) ? 0.5 : 1, cursor: !termsAccepted ? 'not-allowed' : 'pointer' }}
            >
              {publishing
                ? <><Loader2 size={16} className="animate-spin" /> Publishing...</>
                : <><Eye size={16} /> Publish Campaign</>
              }
            </button>
          </div>

          {/* ── Right: Preview ───────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <PreviewCard
              creator={creator}
              term={selectedTerm}
              revenueShare={revenueShare}
              targetAmount={targetAmount}
              returnLow={fanReturnLow}
              returnBase={fanReturnBase}
              returnHigh={fanReturnHigh}
            />

            {/* Term-aware forecast breakdown */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <h4 className="font-bold mb-1" style={{ color: palette.text }}>
                {selectedTerm}-Month Forecast
              </h4>
              <p className="text-xs mb-4" style={{ color: palette.textMuted }}>
                Projected views and AdSense revenue over your campaign term
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Conservative', views: viewsForTerm(forecastLow),  rev: scenarios?.low  ?? '—', color: palette.warning },
                  { label: 'Base',         views: viewsForTerm(forecastBase), rev: scenarios?.base ?? '—', color: palette.success },
                  { label: 'Optimistic',   views: viewsForTerm(forecastHigh), rev: scenarios?.high ?? '—', color: palette.primaryLight },
                ].map(s => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: palette.surfaceAlt }}
                  >
                    <span className="text-xs font-medium" style={{ color: palette.textMuted }}>{s.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: palette.textSubtle }}>
                        {s.views ? `${s.views}M views` : '—'}
                      </span>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.rev}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <h4 className="font-bold mb-3" style={{ color: palette.text }}>How Fan Payouts Work</h4>
              {[
                { icon: TrendingUp,  title: 'Monthly tracking',             desc: 'We track your actual YouTube views every month against the forecast.' },
                { icon: DollarSign,  title: 'Performance-linked payouts',   desc: "Fans' payout = their backing amount × your revenue share × actual performance." },
                { icon: Users,       title: 'Monthly statements',           desc: 'Fans get a detailed monthly statement. No real money changes hands — simulation only.' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${palette.primary}15` }}
                    >
                      <Icon size={14} style={{ color: palette.primary }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: palette.text }}>{item.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
