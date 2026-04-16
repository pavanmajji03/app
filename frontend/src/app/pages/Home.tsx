import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { creators } from '../data/mockData';
import { TrendingUp, Shield, Zap, ArrowRight, Users, BarChart2, DollarSign, ChevronRight } from 'lucide-react';

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  const { palette } = useTheme();
  return (
    <div className="text-center">
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="text-sm mt-0.5" style={{ color: palette.textMuted }}>{label}</p>
    </div>
  );
}

function StepCard({ num, title, desc, icon: Icon }: { num: string; title: string; desc: string; icon: any }) {
  const { palette } = useTheme();
  return (
    <div
      className="flex-1 rounded-2xl p-6"
      style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${palette.primary}22` }}
      >
        <Icon size={18} style={{ color: palette.primary }} />
      </div>
      <div
        className="text-xs font-bold tracking-widest mb-2"
        style={{ color: palette.primary }}
      >
        STEP {num}
      </div>
      <h3 className="font-semibold mb-2" style={{ color: palette.text }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: palette.textMuted }}>{desc}</p>
    </div>
  );
}

function MiniCreatorCard({ creator }: { creator: typeof creators[0] }) {
  const { palette } = useTheme();
  const navigate = useNavigate();

  const riskColors: Record<string, string> = {
    Low: palette.success,
    'Low-Med': '#84CC16',
    Medium: palette.warning,
    High: palette.danger,
  };

  const pct = Math.round((creator.raisedAmount / creator.targetAmount) * 100);

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
      style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
      onClick={() => navigate('/creator')}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${palette.surface} 0%, transparent 60%)` }}
        />
        <div
          className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${riskColors[creator.riskLevel]}22`, color: riskColors[creator.riskLevel] }}
        >
          {creator.riskLevel} Risk
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-sm" style={{ color: palette.text }}>{creator.name}</h4>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
          >
            {creator.category}
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: palette.textMuted }}>{creator.subscribers} subscribers · {creator.avgViews} avg views</p>
        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: palette.textMuted }}>Raised</span>
          <span style={{ color: palette.text }}>${creator.raisedAmount.toLocaleString()} / ${creator.targetAmount.toLocaleString()}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: palette.gradient }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xs" style={{ color: palette.textMuted }}>Base return: </span>
            <span className="text-sm font-bold" style={{ color: palette.success }}>+{creator.returnBase}%</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: palette.primary }}>
            View <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const { palette } = useTheme();
  const navigate = useNavigate();

  const featured = creators.slice(0, 3);

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 max-w-7xl mx-auto">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: palette.gradient }}
        />

        <div className="relative text-center max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: `${palette.primary}18`, border: `1px solid ${palette.primary}40`, color: palette.primary }}
          >
            <Zap size={12} />
            Simulation MVP — No Real Money Required
          </div>

          <h1
            className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6"
            style={{ color: palette.text }}
          >
            Invest in Creators
            <br />
            <span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              You Believe In
            </span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: palette.textMuted }}>
            Fans earn performance-linked returns. Creators get upfront funding.
            Our AI underwrites every channel — so you know exactly what you're backing.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: palette.gradient, color: palette.onPrimary }}
            >
              Browse Marketplace <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/onboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: palette.surfaceAlt, color: palette.text, border: `1px solid ${palette.border}` }}
            >
              List Your Channel
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className="mt-16 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <StatCard value="142" label="Creators Onboarded" color={palette.primary} />
          <StatCard value="$2.4M" label="Paper Investments" color={palette.accent} />
          <StatCard value="3,800+" label="Fan Investors" color={palette.success} />
          <StatCard value="94%" label="Forecast Accuracy" color={palette.primaryLight} />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3" style={{ color: palette.text }}>How It Works</h2>
          <p className="text-base" style={{ color: palette.textMuted }}>Three steps to start earning from creator performance</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <StepCard
            num="01"
            icon={BarChart2}
            title="Browse AI-Underwritten Campaigns"
            desc="Every creator is analyzed by our AI engine across YouTube metrics, social signals, and trend data. You see a full risk report before investing."
          />
          <StepCard
            num="02"
            icon={DollarSign}
            title="Allocate Your Paper Portfolio"
            desc='Use our payout calculator to simulate returns, then allocate fake funds to campaigns you believe in. "If I put $100, what might I earn?"'
          />
          <StepCard
            num="03"
            icon={TrendingUp}
            title="Track Real Performance Payouts"
            desc="Every month, get a real statement based on the creator's actual YouTube performance. Watch your paper portfolio grow with their channel."
          />
        </div>
      </section>

      {/* Featured Creators */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: palette.text }}>Featured Campaigns</h2>
            <p className="text-sm mt-1" style={{ color: palette.textMuted }}>Top-rated creators raising right now</p>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: palette.primary }}
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map(c => (
            <MiniCreatorCard key={c.id} creator={c} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div
          className="rounded-2xl p-10 text-center relative overflow-hidden"
          style={{ background: palette.gradient }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)' }}
          />
          <div className="relative">
            <Shield size={32} className="mx-auto mb-4" style={{ color: palette.onPrimary, opacity: 0.8 }} />
            <h2 className="text-2xl font-bold mb-3" style={{ color: palette.onPrimary }}>
              Are you a creator?
            </h2>
            <p className="mb-6 max-w-md mx-auto" style={{ color: `${palette.onPrimary}cc` }}>
              Submit your YouTube channel and get a free AI underwriting report in minutes. No OAuth, no hassle.
            </p>
            <button
              onClick={() => navigate('/onboard')}
              className="px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
              style={{ backgroundColor: palette.bg, color: palette.primary }}
            >
              Get My Free Report <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
