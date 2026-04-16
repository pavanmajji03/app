import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { callApi } from '../services/apiService';
import type { Creator } from '../data/mockData';
import {
  TrendingUp, BarChart2, DollarSign, Users, Shield, Brain, Star,
  Youtube, Eye, Zap, Search, Activity, FileText, ChevronRight,
  Instagram, Twitter, Globe, CheckCircle, Target, Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/* ── Scene definitions ────────────────────────────────────────────── */
const scenes = [
  { id: 'title', duration: 8000 },
  { id: 'problem', duration: 12000 },
  { id: 'solution', duration: 12000 },
  { id: 'how-it-works', duration: 16000 },
  { id: 'marketplace', duration: 8000 },
  { id: 'ai-engine', duration: 16000 },
  { id: 'report', duration: 12000 },
  { id: 'portfolio', duration: 10000 },
  { id: 'stats', duration: 16000 },
  { id: 'closing', duration: 10000 },
];

const totalDuration = scenes.reduce((a, s) => a + s.duration, 0);

/* ── Helpers ──────────────────────────────────────────────────────── */

function CountUp({ target, duration = 2000, prefix = '', suffix = '' }: {
  target: number; duration?: number; prefix?: string; suffix?: string;
}) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

function Stagger({ children, stagger = 0.3 }: { children: React.ReactNode[]; stagger?: number }) {
  return (
    <>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * stagger, duration: 0.5 }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}

/* ── Scene Components ─────────────────────────────────────────────── */

function TitleScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      {/* glow */}
      <div
        className="absolute w-[700px] h-[500px] rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{ background: palette.gradient }}
      />
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: palette.gradient }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <span className="text-5xl font-black tracking-tight" style={{ color: palette.text }}>
            Fan<span style={{ color: palette.accent }}>Z</span><span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Folio</span>
          </span>
        </div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center mb-4"
          style={{ color: palette.text }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          AI-Powered Creator Investment Platform
        </motion.h1>

        <motion.p
          className="text-xl text-center"
          style={{ color: palette.accent }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Turning Fan Passion Into Financial Returns
        </motion.p>
      </motion.div>
    </div>
  );
}

function ProblemScene() {
  const { palette } = useTheme();
  const cards = [
    { value: '$250B+', label: 'Creator economy projected by 2027', color: palette.primary },
    { value: '50M+', label: 'Content creators worldwide', color: palette.success },
    { value: '0', label: 'Ways for fans to invest in creators they believe in', color: palette.accent, highlight: true },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-12"
        style={{ color: palette.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        The Creator Economy Is <span style={{ color: palette.accent }}>Booming</span>
        <br />
        <span className="text-2xl font-semibold" style={{ color: palette.textMuted }}>
          But Fans Have No Way To Invest
        </span>
      </motion.h2>

      <div className="flex gap-8 w-full max-w-4xl">
        <Stagger stagger={1.5}>
          {cards.map((c) => (
            <div
              key={c.label}
              className="flex-1 rounded-2xl p-8 text-center"
              style={{
                backgroundColor: c.highlight ? `${palette.accent}15` : palette.surface,
                border: `1px solid ${c.highlight ? palette.accent + '40' : palette.border}`,
              }}
            >
              <p className="text-5xl font-black mb-3" style={{ color: c.color }}>{c.value}</p>
              <p className="text-base" style={{ color: palette.textMuted }}>{c.label}</p>
            </div>
          ))}
        </Stagger>
      </div>
    </div>
  );
}

function SolutionScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-4"
        style={{ color: palette.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Fan<span style={{ color: palette.accent }}>Z</span><span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Folio</span>
        : Where Fans Become <span style={{ color: palette.accent }}>Investors</span>
      </motion.h2>

      <div className="flex gap-8 w-full max-w-4xl mt-10">
        <motion.div
          className="flex-1 rounded-2xl p-8"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${palette.success}22` }}>
            <Users size={24} style={{ color: palette.success }} />
          </div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: palette.text }}>For Fans</h3>
          <p className="text-base leading-relaxed" style={{ color: palette.textMuted }}>
            Earn performance-linked returns by backing creators you believe in. Our AI scores every channel so you know exactly what you're investing in.
          </p>
        </motion.div>

        <motion.div
          className="flex-1 rounded-2xl p-8"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${palette.primary}22` }}>
            <Star size={24} style={{ color: palette.primary }} />
          </div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: palette.text }}>For Creators</h3>
          <p className="text-base leading-relaxed" style={{ color: palette.textMuted }}>
            Get upfront funding from your most loyal audience. No equity given up — just a share of ad revenue for a set period.
          </p>
        </motion.div>
      </div>

      <motion.p
        className="text-lg mt-10 text-center max-w-2xl"
        style={{ color: palette.accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Our AI underwrites every channel — so you know exactly what you're backing.
      </motion.p>
    </div>
  );
}

function HowItWorksScene() {
  const { palette } = useTheme();
  const steps = [
    { num: '01', icon: BarChart2, title: 'Browse AI-Underwritten Campaigns', desc: 'Every creator is analyzed across YouTube metrics, social signals, and trend data. Full risk report before investing.' },
    { num: '02', icon: DollarSign, title: 'Allocate Capital', desc: 'Use our payout calculator to simulate returns, then invest in campaigns you believe in.' },
    { num: '03', icon: TrendingUp, title: 'Track Real Performance', desc: 'Every month, get a real statement based on actual YouTube performance. Watch your returns grow.' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-12"
        style={{ color: palette.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        The Fan Investor Journey
      </motion.h2>

      <div className="flex gap-6 w-full max-w-5xl">
        <Stagger stagger={1.5}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="flex-1 rounded-2xl p-6"
                style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${palette.primary}22` }}>
                  <Icon size={22} style={{ color: palette.primary }} />
                </div>
                <div className="text-xs font-bold tracking-widest mb-2" style={{ color: palette.primary }}>STEP {step.num}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: palette.text }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: palette.textMuted }}>{step.desc}</p>
              </div>
            );
          })}
        </Stagger>
      </div>
    </div>
  );
}

function MarketplaceScene({ creators }: { creators: Creator[] }) {
  const { palette } = useTheme();
  const featured = creators.slice(0, 3);
  const riskColors: Record<string, string> = { Low: palette.success, 'Low-Med': '#84CC16', Medium: palette.warning, High: palette.danger };

  return (
    <div className="flex flex-col items-center justify-center h-full px-12">
      <motion.h2
        className="text-3xl font-black text-center mb-8"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        AI-Scored Creator Marketplace
      </motion.h2>

      {/* Mock browser */}
      <motion.div
        className="w-full max-w-5xl rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${palette.border}` }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ backgroundColor: palette.surfaceAlt }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
          </div>
          <div className="flex-1 text-center text-xs" style={{ color: palette.textSubtle }}>fanzfolio.io/marketplace</div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-3 gap-4" style={{ backgroundColor: palette.bg }}>
          <Stagger stagger={0.5}>
            {featured.map((c) => {
              const pct = Math.round((c.raisedAmount / c.targetAmount) * 100);
              return (
                <div
                  key={c.id}
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${palette.surface} 0%, transparent 60%)` }} />
                    <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${riskColors[c.riskLevel]}22`, color: riskColors[c.riskLevel] }}>
                      {c.riskLevel} Risk
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm" style={{ color: palette.text }}>{c.name}</h4>
                      {/* AI Score badge */}
                      <motion.div
                        className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: c.aiScore >= 80 ? `${palette.success}22` : `${palette.warning}22`,
                          color: c.aiScore >= 80 ? palette.success : palette.warning,
                          boxShadow: `0 0 12px ${c.aiScore >= 80 ? palette.success : palette.warning}40`,
                        }}
                        animate={{ boxShadow: [`0 0 8px ${palette.primary}20`, `0 0 20px ${palette.primary}50`, `0 0 8px ${palette.primary}20`] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Star size={10} /> {c.aiScore}
                      </motion.div>
                    </div>
                    <p className="text-[10px] mb-2" style={{ color: palette.textMuted }}>{c.subscribers} subs · {c.avgViews} avg</p>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: palette.gradient }} />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px]" style={{ color: palette.textMuted }}>
                      <span>${c.raisedAmount.toLocaleString()} raised</span>
                      <span style={{ color: palette.success }}>+{c.returnBase}% base</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </Stagger>
        </div>
      </motion.div>
    </div>
  );
}

function AIEngineScene() {
  const { palette } = useTheme();
  const steps = [
    { icon: Search, label: 'Data Collection', desc: 'YouTube, Instagram, TikTok, X, Google Trends, News' },
    { icon: Activity, label: 'Multi-Factor Scoring', desc: '6 categories, 0-100 each — rules-based + AI adjustment' },
    { icon: TrendingUp, label: 'Trajectory Prediction', desc: 'Linear regression on video performance trends' },
    { icon: DollarSign, label: 'Revenue Estimation', desc: 'Long-form vs Shorts RPM modeling' },
    { icon: Shield, label: 'Transparency Layer', desc: 'Full data sources, confidence intervals, life events' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-4"
        style={{ color: palette.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        The AI That <span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Powers Everything</span>
      </motion.h2>
      <motion.p
        className="text-base text-center mb-12"
        style={{ color: palette.textMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Scores calculated from real data, not AI guessing. Then AI reviews and adjusts by max 20 points.
      </motion.p>

      {/* Pipeline */}
      <div className="flex items-center gap-3 w-full max-w-5xl">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              className="flex-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 1.8, duration: 0.5 }}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative"
                  style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
                  animate={{
                    borderColor: [palette.border, palette.primary, palette.border],
                    boxShadow: [`0 0 0px ${palette.primary}00`, `0 0 20px ${palette.primary}60`, `0 0 0px ${palette.primary}00`],
                  }}
                  transition={{ delay: i * 1.8, duration: 1.5 }}
                >
                  <Icon size={24} style={{ color: palette.primary }} />
                </motion.div>
                <p className="text-sm font-bold text-center mb-1" style={{ color: palette.text }}>{step.label}</p>
                <p className="text-[10px] text-center leading-tight" style={{ color: palette.textMuted }}>{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  className="absolute"
                  style={{ display: 'none' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Scoring categories */}
      <motion.div
        className="mt-10 grid grid-cols-6 gap-3 w-full max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 9, duration: 0.5 }}
      >
        {[
          { label: 'Growth', value: 85, color: palette.success },
          { label: 'Engagement', value: 78, color: palette.success },
          { label: 'Monetization', value: 72, color: palette.warning },
          { label: 'Consistency', value: 90, color: palette.success },
          { label: 'Trend Alignment', value: 68, color: palette.warning },
          { label: 'Platform Risk', value: 82, color: palette.success },
        ].map((cat) => (
          <div
            key={cat.label}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <p className="text-2xl font-black" style={{ color: cat.color }}>{cat.value}</p>
            <p className="text-[10px] mt-1" style={{ color: palette.textMuted }}>{cat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ReportScene({ creators }: { creators: Creator[] }) {
  const { palette } = useTheme();
  const creator = creators[0];
  const circumference = 2 * Math.PI * 45;
  const scoreOffset = circumference - (creator.aiScore / 100) * circumference;
  const scoreColor = creator.aiScore >= 80 ? palette.success : palette.warning;

  const forecastChartData = [
    { period: '30d', Low: creator.forecastData.views30.low, Base: creator.forecastData.views30.base, High: creator.forecastData.views30.high },
    { period: '90d', Low: creator.forecastData.views90.low, Base: creator.forecastData.views90.base, High: creator.forecastData.views90.high },
    { period: '180d', Low: creator.forecastData.views180.low, Base: creator.forecastData.views180.base, High: creator.forecastData.views180.high },
  ];

  const riskBars = [
    { label: 'Growth Trend', value: creator.riskFactors.growthTrend },
    { label: 'Cadence Reliability', value: creator.riskFactors.cadenceReliability },
    { label: 'Platform Diversity', value: creator.riskFactors.platformDiversification },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-12">
      <motion.h2
        className="text-3xl font-black text-center mb-6"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        AI Underwriting Report
      </motion.h2>

      {/* Mock browser */}
      <motion.div
        className="w-full max-w-5xl rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${palette.border}` }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: palette.surfaceAlt }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
          </div>
          <div className="flex-1 text-center text-xs" style={{ color: palette.textSubtle }}>fanzfolio.io/report</div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-5" style={{ backgroundColor: palette.bg }}>
          {/* Score Gauge */}
          <div className="flex flex-col items-center justify-center rounded-xl p-4" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <p className="text-sm font-bold mb-3" style={{ color: palette.text }}>{creator.name}</p>
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke={`${scoreColor}18`} strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" stroke={scoreColor} strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: scoreOffset }}
                  transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black" style={{ color: scoreColor }}>{creator.aiScore}</span>
                <span className="text-xs" style={{ color: palette.textMuted }}>/ 100</span>
              </div>
            </div>
            <span className="text-xs font-bold mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${scoreColor}18`, color: scoreColor }}>
              Strong
            </span>
          </div>

          {/* Risk Bars */}
          <div className="rounded-xl p-4" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <p className="text-sm font-bold mb-4" style={{ color: palette.text }}>Risk Analysis</p>
            {riskBars.map((bar, i) => {
              const barColor = bar.value >= 75 ? palette.success : bar.value >= 50 ? palette.warning : palette.danger;
              return (
                <div key={bar.label} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px]" style={{ color: palette.textMuted }}>{bar.label}</span>
                    <span className="text-[10px] font-bold" style={{ color: barColor }}>{bar.value}/100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.value}%` }}
                      transition={{ delay: 1 + i * 0.3, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Forecast Chart */}
          <div className="rounded-xl p-4" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
            <p className="text-sm font-bold mb-2" style={{ color: palette.text }}>View Forecast (M)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={forecastChartData} barGap={2} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={`${palette.border}60`} vertical={false} />
                <XAxis dataKey="period" tick={{ fill: palette.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: palette.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Bar dataKey="Low" fill={palette.warning} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Base" fill={palette.primary} radius={[3, 3, 0, 0]} />
                <Bar dataKey="High" fill={palette.success} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PortfolioScene() {
  const { palette } = useTheme();

  const metrics = [
    { label: 'Total Invested', value: 750, prefix: '$', color: palette.text },
    { label: 'Current Value', value: 769, prefix: '$', color: palette.primary },
    { label: 'Total Earned', value: 16, prefix: '$', suffix: '.18', color: palette.success },
    { label: 'Active Campaigns', value: 2, color: palette.accent },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-10"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Portfolio & Returns
      </motion.h2>

      <div className="w-full max-w-4xl">
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Stagger stagger={0.3}>
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl p-5 text-center"
                style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
              >
                <p className="text-3xl font-black" style={{ color: m.color }}>
                  <CountUp target={m.value} prefix={m.prefix || ''} suffix={m.suffix || ''} />
                </p>
                <p className="text-xs mt-1" style={{ color: palette.textMuted }}>{m.label}</p>
              </div>
            ))}
          </Stagger>
        </div>

        {/* Statement preview + accuracy callout */}
        <div className="grid grid-cols-2 gap-6">
          <motion.div
            className="rounded-xl p-5"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: palette.text }}>Monthly Statement — TechVault</p>
            {[
              { label: 'Actual Views', value: '58.2M' },
              { label: 'Base Forecast', value: '55M' },
              { label: 'Revenue Share', value: '5%' },
              { label: 'Your Payout', value: '$6.22', highlight: true },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-1.5 border-b" style={{ borderColor: `${palette.border}60` }}>
                <span className="text-xs" style={{ color: palette.textMuted }}>{row.label}</span>
                <span className="text-xs font-bold" style={{ color: row.highlight ? palette.success : palette.text }}>{row.value}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="rounded-xl p-5 flex flex-col items-center justify-center"
            style={{ backgroundColor: `${palette.success}10`, border: `1px solid ${palette.success}30` }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
          >
            <CheckCircle size={40} style={{ color: palette.success, marginBottom: 12 }} />
            <p className="text-5xl font-black" style={{ color: palette.success }}>94%</p>
            <p className="text-sm mt-2" style={{ color: palette.textMuted }}>Forecast Accuracy</p>
            <p className="text-xs mt-1 text-center" style={{ color: palette.textSubtle }}>
              Actual views exceeded base forecast by +5.8%
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatsScene() {
  const { palette } = useTheme();
  const stats = [
    { value: '$250B+', label: 'Projected creator economy by 2027', source: 'Goldman Sachs' },
    { value: '50M+', label: 'Content creators worldwide', source: 'SignalFire' },
    { value: '67%', label: 'Of creators want alternative funding', source: 'Linktree Creator Report' },
    { value: '$1.3B+', label: 'Raised in creator-focused startups in 2024', source: 'Crunchbase' },
    { value: '4%', label: 'Of creators earn more than $100K/year', source: 'Linktree' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span style={{ background: palette.accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          The Opportunity
        </span>
      </motion.h2>

      <div className="w-full max-w-4xl space-y-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex items-center gap-6 rounded-xl p-5"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            initial={{ opacity: 0, scale: 0.9, x: i % 2 === 0 ? -40 : 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: i * 2.2, duration: 0.5 }}
          >
            <p className="text-4xl font-black min-w-[140px]" style={{ color: palette.primary }}>{stat.value}</p>
            <div className="flex-1">
              <p className="text-base font-medium" style={{ color: palette.text }}>{stat.label}</p>
              <p className="text-xs mt-0.5" style={{ color: palette.textSubtle }}>Source: {stat.source}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-lg font-semibold text-center mt-8"
        style={{ color: palette.accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 12 }}
      >
        FanZFolio democratizes creator investment for everyone.
      </motion.p>
    </div>
  );
}

function ClosingScene() {
  const { palette } = useTheme();
  const differentiators = [
    { icon: Brain, label: 'AI-First' },
    { icon: Shield, label: 'Transparent' },
    { icon: Users, label: 'Fan-Powered' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div
        className="absolute w-[800px] h-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{ background: palette.gradient }}
      />

      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: palette.gradient }}>
            <TrendingUp size={32} color="#fff" />
          </div>
          <span className="text-6xl font-black tracking-tight" style={{ color: palette.text }}>
            Fan<span style={{ color: palette.accent }}>Z</span><span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Folio</span>
          </span>
        </div>

        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center mb-8"
          style={{ color: palette.text }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Invest in Creators{' '}
          <span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            You Believe In
          </span>
        </motion.h1>

        <motion.div
          className="flex gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {differentiators.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.label} className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${palette.primary}22` }}
                >
                  <Icon size={24} style={{ color: palette.primary }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: palette.textMuted }}>{d.label}</span>
              </div>
            );
          })}
        </motion.div>

        <motion.p
          className="text-lg mt-10"
          style={{ color: palette.textSubtle }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          Thank you.
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ── Main PitchVideo Component ────────────────────────────────────── */

export function PitchVideo() {
  const { palette, setPalette } = useTheme();
  const [currentScene, setCurrentScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const [creators, setCreators] = useState<Creator[]>([]);

  // Force midnight palette
  useEffect(() => {
    setPalette('midnight');
  }, [setPalette]);

  useEffect(() => {
    callApi<Creator[]>('getCreators_PitchVideo').then(res => setCreators(res.data));
  }, []);

  // Scene timer
  useEffect(() => {
    if (paused || currentScene >= scenes.length) return;

    timerRef.current = window.setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene((prev) => prev + 1);
        elapsedRef.current += scenes[currentScene].duration;
        setElapsed(elapsedRef.current);
      }
    }, scenes[currentScene].duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentScene, paused]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setPaused((p) => !p);
    } else if (e.code === 'ArrowRight' && currentScene < scenes.length - 1) {
      elapsedRef.current += scenes[currentScene].duration;
      setElapsed(elapsedRef.current);
      setCurrentScene((p) => p + 1);
    } else if (e.code === 'ArrowLeft' && currentScene > 0) {
      elapsedRef.current -= scenes[currentScene - 1].duration;
      setElapsed(elapsedRef.current);
      setCurrentScene((p) => p - 1);
    }
  }, [currentScene]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderScene = () => {
    switch (scenes[currentScene]?.id) {
      case 'title': return <TitleScene />;
      case 'problem': return <ProblemScene />;
      case 'solution': return <SolutionScene />;
      case 'how-it-works': return <HowItWorksScene />;
      case 'marketplace': return <MarketplaceScene creators={creators} />;
      case 'ai-engine': return <AIEngineScene />;
      case 'report': return <ReportScene creators={creators} />;
      case 'portfolio': return <PortfolioScene />;
      case 'stats': return <StatsScene />;
      case 'closing': return <ClosingScene />;
      default: return null;
    }
  };

  const progressPct = (elapsed / totalDuration) * 100;

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ backgroundColor: palette.bg }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={scenes[currentScene]?.id}
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {renderScene()}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: `${palette.border}40` }}>
        <motion.div
          className="h-full"
          style={{ background: palette.gradient }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Pause indicator */}
      {paused && (
        <div className="absolute top-6 right-6 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${palette.warning}22`, color: palette.warning }}>
          PAUSED — Press Space
        </div>
      )}

      {/* Scene indicator */}
      <div className="absolute bottom-4 right-4 text-[10px]" style={{ color: palette.textSubtle }}>
        {currentScene + 1} / {scenes.length}
      </div>
    </div>
  );
}
