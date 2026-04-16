import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { creators } from '../data/mockData';
import { Clock, DollarSign, Users, TrendingUp, Eye, ArrowRight, Info, Zap } from 'lucide-react';

const creator = creators[0];

const termOptions = [
  { months: 6, label: '6 months', desc: 'Short-term, lower commitment', popular: false },
  { months: 12, label: '12 months', desc: 'Most popular term for creators', popular: true },
  { months: 24, label: '24 months', desc: 'Long-term partnership', popular: false },
];

function PreviewCard({ term, revenueShare }: { term: number; revenueShare: number }) {
  const { palette } = useTheme();

  const baseReturn = ((creator.returnBase * revenueShare) / 5).toFixed(1);
  const lowReturn = ((creator.returnLow * revenueShare) / 5).toFixed(1);
  const highReturn = ((creator.returnHigh * revenueShare) / 5).toFixed(1);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `2px solid ${palette.primary}` }}
    >
      <div
        className="px-4 py-2 text-xs font-bold tracking-wider text-center"
        style={{ background: palette.gradient, color: palette.onPrimary }}
      >
        CAMPAIGN PREVIEW
      </div>
      <div className="p-4" style={{ backgroundColor: palette.surface }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl overflow-hidden"
            style={{ border: `2px solid ${palette.primary}` }}
          >
            <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
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
            <p className="text-xs font-bold" style={{ color: palette.success }}>+{baseReturn}%</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Base Return</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: palette.textMuted }}>Raise Target</span>
            <span style={{ color: palette.text }}>$50,000</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
            <div className="h-full rounded-full w-0" style={{ background: palette.gradient }} />
          </div>
          <p className="text-xs mt-1" style={{ color: palette.textSubtle }}>0 investors · just launched</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Low', value: `+${lowReturn}%`, color: palette.warning },
            { label: 'Base', value: `+${baseReturn}%`, color: palette.success },
            { label: 'High', value: `+${highReturn}%`, color: palette.primaryLight },
          ].map(s => (
            <div key={s.label} className="p-2 rounded-lg" style={{ backgroundColor: palette.surfaceAlt }}>
              <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: palette.textSubtle }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CampaignSetup() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [selectedTerm, setSelectedTerm] = useState(12);
  const [revenueShare, setRevenueShare] = useState(5);
  const [targetAmount, setTargetAmount] = useState(50000);

  const estimatedFanReturn = ((creator.returnBase * revenueShare) / 5).toFixed(1);

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
          >
            <Zap size={12} /> AI Score 87/100 · Ready to list
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: palette.text }}>Set Campaign Terms</h1>
          <p style={{ color: palette.textMuted }}>
            Configure your campaign terms. Fans will see a projected payout range based on your AI forecast.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Config */}
          <div className="flex flex-col gap-6">
            {/* Term */}
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
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: palette.accentGradient, color: palette.onAccent, fontSize: '9px', fontWeight: 700 }}
                      >
                        POPULAR
                      </div>
                    )}
                    <p className="font-bold text-sm mb-0.5" style={{ color: selectedTerm === opt.months ? palette.primary : palette.text }}>
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
                  At <strong>{revenueShare}%</strong> revenue share, fans can expect a base projected return of <strong>~{estimatedFanReturn}%</strong> over {selectedTerm} months.
                </p>
              </div>
            </div>

            {/* Target Amount */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} style={{ color: palette.primary }} />
                <h3 className="font-bold" style={{ color: palette.text }}>Raise Target</h3>
              </div>
              <div className="flex gap-3 mb-3">
                {[25000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setTargetAmount(amt)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium"
                    style={{
                      backgroundColor: targetAmount === amt ? `${palette.primary}18` : palette.surfaceAlt,
                      color: targetAmount === amt ? palette.primary : palette.textMuted,
                      border: `1px solid ${targetAmount === amt ? palette.primary : 'transparent'}`,
                    }}
                  >
                    ${(amt / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.textSubtle }}>$</span>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={e => setTargetAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}`, color: palette.text }}
                />
              </div>
            </div>

            {/* Summary */}
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
            >
              <h4 className="text-xs font-semibold mb-3" style={{ color: palette.textMuted }}>Campaign Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Term', value: `${selectedTerm} months` },
                  { label: 'Revenue Share', value: `${revenueShare}%` },
                  { label: 'Raise Target', value: `$${targetAmount.toLocaleString()}` },
                  { label: 'Fan Base Return', value: `~${estimatedFanReturn}%` },
                  { label: 'Your AI Score', value: '87 / 100' },
                  { label: 'Risk Rating', value: 'Low' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span style={{ color: palette.textSubtle }}>{item.label}</span>
                    <span style={{ color: palette.text }} className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/campaign-live')}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
              style={{ background: palette.gradient, color: palette.onPrimary }}
            >
              <Eye size={16} /> Publish Campaign
            </button>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col gap-4">
            <PreviewCard term={selectedTerm} revenueShare={revenueShare} />

            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <h4 className="font-bold mb-3" style={{ color: palette.text }}>How Fan Payouts Work</h4>
              {[
                { icon: TrendingUp, title: 'Monthly tracking', desc: 'We track your actual YouTube views every month against the forecast.' },
                { icon: DollarSign, title: 'Performance-linked payouts', desc: "Fans' payout = their investment × your revenue share × actual performance." },
                { icon: Users, title: 'Monthly statements', desc: 'Fans get a detailed monthly statement. No real money changes hands — simulation only.' },
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
