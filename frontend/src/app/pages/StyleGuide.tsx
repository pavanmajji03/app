import { useTheme, palettes, PaletteKey } from '../context/ThemeContext';
import { TrendingUp, Star, Shield, AlertTriangle, CheckCircle, Zap, Info, ArrowRight } from 'lucide-react';

const paletteKeys: PaletteKey[] = ['midnight', 'ocean', 'forest', 'luxe'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <div className="mb-12">
      <h2
        className="text-lg font-bold mb-6 pb-3"
        style={{ color: palette.text, borderBottom: `1px solid ${palette.border}` }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Chip({ label, style }: { label: string; style?: React.CSSProperties }) {
  return (
    <span
      className="inline-block text-xs font-medium px-3 py-1 rounded-full"
      style={style}
    >
      {label}
    </span>
  );
}

export function StyleGuide() {
  const { palette, paletteKey, setPalette } = useTheme();

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
          >
            <Zap size={12} /> Design System
          </span>
          <h1 className="text-4xl font-black mb-2" style={{ color: palette.text }}>
            CreatorBond Style Guide
          </h1>
          <p style={{ color: palette.textMuted }}>
            Color palettes, typography, components and UI patterns used across the platform.
          </p>
        </div>

        {/* Palette Switcher */}
        <Section title="Color Palettes">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {paletteKeys.map(key => {
              const p = palettes[key];
              const isActive = paletteKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setPalette(key)}
                  className="rounded-2xl overflow-hidden text-left transition-all hover:-translate-y-1"
                  style={{
                    border: `2px solid ${isActive ? p.primary : 'transparent'}`,
                    outline: isActive ? `4px solid ${p.primary}30` : 'none',
                  }}
                >
                  {/* Swatch */}
                  <div className="h-16 relative" style={{ background: p.gradient }}>
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)' }}
                    />
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle size={16} color={p.onPrimary} />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div
                    className="p-3"
                    style={{ backgroundColor: p.surface }}
                  >
                    <p className="font-bold text-sm mb-0.5" style={{ color: p.text }}>{p.name}</p>
                    <p className="text-xs" style={{ color: p.textMuted }}>{p.description.split('—')[0].trim()}</p>
                    <div className="flex gap-1 mt-2">
                      {p.swatches.map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color tokens for active palette */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Background', color: palette.bg, text: palette.text },
              { label: 'Surface', color: palette.surface, text: palette.text },
              { label: 'Surface Alt', color: palette.surfaceAlt, text: palette.text },
              { label: 'Border', color: palette.border, text: palette.text },
              { label: 'Primary', color: palette.primary, text: palette.onPrimary },
              { label: 'Primary Light', color: palette.primaryLight, text: palette.bg },
              { label: 'Accent', color: palette.accent, text: palette.onAccent },
              { label: 'Text Muted', color: palette.bg, text: palette.textMuted },
              { label: 'Success', color: palette.success, text: '#000' },
              { label: 'Warning', color: palette.warning, text: '#000' },
              { label: 'Danger', color: palette.danger, text: '#fff' },
              { label: 'Text Subtle', color: palette.bg, text: palette.textSubtle },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${palette.border}` }}
              >
                <div className="h-10" style={{ backgroundColor: item.color }} />
                <div className="px-3 py-2" style={{ backgroundColor: palette.surface }}>
                  <p className="text-xs font-medium" style={{ color: palette.text }}>{item.label}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: palette.textSubtle }}>
                    {item.color}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <p className="text-5xl font-black mb-3" style={{ color: palette.text }}>Display Heading</p>
            <p className="text-3xl font-bold mb-3" style={{ color: palette.text }}>Section Heading</p>
            <p className="text-xl font-bold mb-3" style={{ color: palette.text }}>Card Heading</p>
            <p className="text-base font-semibold mb-3" style={{ color: palette.text }}>Subtitle / Label</p>
            <p className="text-sm mb-3 leading-relaxed" style={{ color: palette.textMuted }}>
              Body text. Fans earn performance-linked returns. Creators get upfront funding. Our AI underwrites every channel — so you know exactly what you're backing. This is what longer body copy looks like across the platform.
            </p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>
              Caption / helper text · Supplementary information in a smaller weight
            </p>
          </div>
        </Section>

        {/* Gradients */}
        <Section title="Gradients">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Primary Gradient', gradient: palette.gradient },
              { label: 'Accent Gradient', gradient: palette.accentGradient },
            ].map(item => (
              <div key={item.label} className="rounded-2xl overflow-hidden">
                <div
                  className="h-24 flex items-end p-4"
                  style={{ background: item.gradient }}
                >
                  <p className="font-bold text-sm" style={{ color: item.label.includes('Accent') ? palette.onAccent : palette.onPrimary }}>
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons & CTAs">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: palette.gradient, color: palette.onPrimary }}
              >
                Primary <ArrowRight size={14} />
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: palette.surfaceAlt, color: palette.text, border: `1px solid ${palette.border}` }}
              >
                Secondary
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: palette.accentGradient, color: palette.onAccent }}
              >
                Accent <Zap size={14} />
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ color: palette.primary, border: `1px solid ${palette.primary}` }}
              >
                Outline
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm opacity-40 cursor-not-allowed"
                style={{ backgroundColor: palette.surfaceAlt, color: palette.textSubtle }}
                disabled
              >
                Disabled
              </button>
            </div>

            {/* Icon buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: palette.gradient }}
              >
                <TrendingUp size={18} style={{ color: palette.onPrimary }} />
              </button>
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
              >
                <Star size={18} style={{ color: palette.primary }} />
              </button>
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${palette.success}18` }}
              >
                <CheckCircle size={18} style={{ color: palette.success }} />
              </button>
            </div>
          </div>
        </Section>

        {/* Badges & Tags */}
        <Section title="Badges & Tags">
          <div
            className="rounded-2xl p-6 flex flex-wrap gap-3"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <Chip label="Low Risk" style={{ backgroundColor: `${palette.success}18`, color: palette.success }} />
            <Chip label="Medium Risk" style={{ backgroundColor: `${palette.warning}18`, color: palette.warning }} />
            <Chip label="High Risk" style={{ backgroundColor: `${palette.danger}18`, color: palette.danger }} />
            <Chip label="Tech Reviews" style={{ backgroundColor: `${palette.primary}15`, color: palette.primaryLight }} />
            <Chip label="AI Score 87" style={{ backgroundColor: `${palette.success}18`, color: palette.success, border: `1px solid ${palette.success}30` }} />
            <Chip label="LIVE" style={{ backgroundColor: `${palette.success}18`, color: palette.success }} />
            <Chip label="PROTOTYPE" style={{ backgroundColor: `${palette.primary}22`, color: palette.primary }} />
            <Chip label="POPULAR" style={{ background: palette.accentGradient, color: palette.onAccent }} />
            <Chip label="Simulation only" style={{ backgroundColor: palette.surfaceAlt, color: palette.textSubtle }} />
          </div>
        </Section>

        {/* Alert / Info Boxes */}
        <Section title="Alerts & Info Banners">
          <div className="flex flex-col gap-4">
            {[
              {
                icon: CheckCircle,
                label: 'Success',
                text: 'Campaign published successfully. Fans can now browse, simulate returns, and paper-invest.',
                color: palette.success,
              },
              {
                icon: AlertTriangle,
                label: 'Warning',
                text: 'This creator has high concentration risk — a significant share of views comes from 1–2 viral videos.',
                color: palette.warning,
              },
              {
                icon: Shield,
                label: 'Info',
                text: 'We only analyze publicly available data. No OAuth, no private credentials required.',
                color: palette.primary,
              },
              {
                icon: Info,
                label: 'Danger',
                text: 'AI Score below 50: This channel does not qualify for a campaign listing at this time.',
                color: palette.danger,
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: `${item.color}10`, border: `1px solid ${item.color}25` }}
                >
                  <Icon size={16} style={{ color: item.color, marginTop: 1 }} className="flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold mb-0.5" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: palette.textMuted }}>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Cards */}
        <Section title="Card Variants">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Default surface card */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: palette.textMuted }}>Surface Card</p>
              <p className="font-bold" style={{ color: palette.text }}>Standard panel</p>
              <p className="text-sm mt-2" style={{ color: palette.textMuted }}>
                Used for content sections, metric cards, and data displays.
              </p>
            </div>

            {/* Gradient card */}
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: palette.gradient }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }}
              />
              <div className="relative">
                <p className="text-xs font-bold mb-1" style={{ color: `${palette.onPrimary}99` }}>Gradient Card</p>
                <p className="font-bold" style={{ color: palette.onPrimary }}>Hero / CTA panel</p>
                <p className="text-sm mt-2" style={{ color: `${palette.onPrimary}cc` }}>
                  Used for statement headers, campaign CTAs, and hero banners.
                </p>
              </div>
            </div>

            {/* Alt surface card */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: palette.textMuted }}>Surface Alt Card</p>
              <p className="font-bold" style={{ color: palette.text }}>Secondary panel</p>
              <p className="text-sm mt-2" style={{ color: palette.textMuted }}>
                Used for IOI boxes, nested content areas, and supplementary sections.
              </p>
            </div>
          </div>
        </Section>

        {/* Progress Bars */}
        <Section title="Progress Bars">
          <div
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            {[
              { label: 'Raise Progress (77%)', value: 77, color: palette.gradient, isGradient: true },
              { label: 'Growth Trend (85/100)', value: 85, color: palette.success, isGradient: false },
              { label: 'Cadence Reliability (90/100)', value: 90, color: palette.primaryLight, isGradient: false },
              { label: 'Volatility Risk (22/100)', value: 22, color: palette.danger, isGradient: false },
              { label: 'AI Confidence (84%)', value: 84, color: palette.primary, isGradient: false },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: palette.textMuted }}>{item.label}</span>
                  <span style={{ color: palette.text }}>{item.value}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.value}%`,
                      ...(item.isGradient ? { background: item.color } : { backgroundColor: item.color }),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Spacing & Radius */}
        <Section title="Spacing & Border Radius">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <div className="flex flex-wrap items-end gap-4">
              {[
                { label: 'rounded-lg', r: '0.5rem' },
                { label: 'rounded-xl', r: '0.75rem' },
                { label: 'rounded-2xl', r: '1rem' },
                { label: 'rounded-3xl', r: '1.5rem' },
                { label: 'rounded-full', r: '9999px' },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16"
                    style={{ backgroundColor: `${palette.primary}30`, borderRadius: item.r, border: `2px solid ${palette.primary}` }}
                  />
                  <span className="text-xs font-mono" style={{ color: palette.textSubtle }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* AI Score Gauge demo */}
        <Section title="AI Score Gauge">
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          >
            <div className="flex flex-wrap gap-8 items-center justify-center">
              {[
                { score: 87, label: 'Strong (≥80)' },
                { score: 72, label: 'Good (65–79)' },
                { score: 55, label: 'Moderate (<65)' },
              ].map(({ score, label }) => {
                const color = score >= 80 ? palette.success : score >= 65 ? palette.warning : palette.danger;
                const circumference = 2 * Math.PI * 45;
                const offset = circumference - (score / 100) * circumference;
                return (
                  <div key={score} className="flex flex-col items-center gap-3">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke={`${color}18`} strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black" style={{ color }}>{score}</span>
                        <span className="text-xs" style={{ color: palette.textMuted }}>/ 100</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className="text-sm font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${color}18`, color }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        <div className="text-center pb-8">
          <p className="text-xs" style={{ color: palette.textSubtle }}>
            CreatorBond Design System — Simulation MVP · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
