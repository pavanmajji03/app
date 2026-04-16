import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { Youtube, Instagram, Twitter, Video, ChevronRight, Check, Zap, Shield, TrendingUp } from 'lucide-react';

const steps = ['Channel', 'Social Links', 'Upcoming Video', 'Review'];

function StepIndicator({ current }: { current: number }) {
  const { palette } = useTheme();
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                backgroundColor: idx < current ? palette.primary : idx === current ? palette.primary : palette.surfaceAlt,
                color: idx <= current ? palette.onPrimary : palette.textSubtle,
              }}
            >
              {idx < current ? <Check size={14} /> : idx + 1}
            </div>
            <span
              className="text-xs mt-1.5 hidden sm:block"
              style={{ color: idx === current ? palette.text : palette.textSubtle }}
            >
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className="h-0.5 w-12 sm:w-20 mx-1"
              style={{ backgroundColor: idx < current ? palette.primary : palette.border }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({
  label, placeholder, value, onChange, icon: Icon, hint, optional = false
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  icon?: any; hint?: string; optional?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium" style={{ color: palette.text }}>{label}</label>
        {optional && <span className="text-xs" style={{ color: palette.textSubtle }}>Optional</span>}
      </div>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon size={15} style={{ color: palette.textSubtle }} />
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            paddingLeft: Icon ? '2.25rem' : '0.875rem',
            paddingRight: '0.875rem',
            backgroundColor: palette.surfaceAlt,
            border: `1px solid ${palette.border}`,
            color: palette.text,
          }}
          onFocus={e => {
            e.target.style.borderColor = palette.primary;
            e.target.style.boxShadow = `0 0 0 3px ${palette.primary}18`;
          }}
          onBlur={e => {
            e.target.style.borderColor = palette.border;
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      {hint && <p className="text-xs mt-1" style={{ color: palette.textSubtle }}>{hint}</p>}
    </div>
  );
}

function TextareaField({ label, placeholder, value, onChange, optional = false }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; optional?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium" style={{ color: palette.text }}>{label}</label>
        {optional && <span className="text-xs" style={{ color: palette.textSubtle }}>Optional</span>}
      </div>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-3 rounded-xl text-sm outline-none resize-none transition-all"
        style={{
          backgroundColor: palette.surfaceAlt,
          border: `1px solid ${palette.border}`,
          color: palette.text,
        }}
        onFocus={e => {
          e.target.style.borderColor = palette.primary;
          e.target.style.boxShadow = `0 0 0 3px ${palette.primary}18`;
        }}
        onBlur={e => {
          e.target.style.borderColor = palette.border;
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export function CreatorOnboarding() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    youtubeUrl: 'https://youtube.com/@techvault',
    instagram: '@techvault',
    tiktok: '',
    twitter: '@techvaultYT',
    videoTitle: 'The M4 MacBook Air vs M4 MacBook Pro — Which Should You Buy?',
    videoDesc: 'A comprehensive comparison of Apple\'s latest MacBook lineup for 2026...',
    videoDate: '2026-03-28',
    videoFormat: 'Review / Comparison',
  });

  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const canProceed = step === 0 ? form.youtubeUrl.length > 0 : true;

  const handleSubmit = () => navigate('/analysis');

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
          >
            <Zap size={12} /> Free AI Analysis
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: palette.text }}>List Your Channel</h1>
          <p style={{ color: palette.textMuted }}>
            Submit your channel and get a free AI underwriting report in minutes.
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Form Card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          {step === 0 && (
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: palette.text }}>Your YouTube Channel</h2>
              <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
                Enter your channel URL or @handle. This is the only required field.
              </p>
              <InputField
                label="YouTube Channel URL or @handle"
                placeholder="https://youtube.com/@yourchannel"
                value={form.youtubeUrl}
                onChange={set('youtubeUrl')}
                icon={Youtube}
                hint="We'll automatically pull public channel data — subscribers, views, upload history, etc."
              />

              {/* What we analyze */}
              <div
                className="mt-5 rounded-xl p-4"
                style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
              >
                <p className="text-xs font-semibold mb-3" style={{ color: palette.text }}>What we automatically analyze:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Subscriber count & growth',
                    'Last 30 videos performance',
                    'View velocity & trend',
                    'Engagement rate',
                    'Upload consistency',
                    'Concentration risk',
                    'Topic trending signals',
                    'Cross-platform mentions',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-1.5">
                      <Check size={11} style={{ color: palette.success }} />
                      <span className="text-xs" style={{ color: palette.textMuted }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: palette.text }}>Social Media Links</h2>
              <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
                Adding cross-platform signals improves the accuracy of your AI forecast.
              </p>
              <InputField
                label="Instagram"
                placeholder="@yourusername"
                value={form.instagram}
                onChange={set('instagram')}
                icon={Instagram}
                optional
              />
              <InputField
                label="TikTok"
                placeholder="@yourusername"
                value={form.tiktok}
                onChange={set('tiktok')}
                icon={Video}
                optional
              />
              <InputField
                label="X / Twitter"
                placeholder="@yourusername"
                value={form.twitter}
                onChange={set('twitter')}
                icon={Twitter}
                optional
              />

              <div
                className="mt-2 p-3 rounded-xl flex items-start gap-2"
                style={{ backgroundColor: `${palette.primary}10`, border: `1px solid ${palette.primary}20` }}
              >
                <TrendingUp size={14} style={{ color: palette.primary, marginTop: 1 }} />
                <p className="text-xs" style={{ color: palette.primary }}>
                  Channels with 2+ platforms linked see an average of <strong>+18% improvement</strong> in forecast confidence scores.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: palette.text }}>Upcoming Video (Optional)</h2>
              <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
                Share your next video details for a video-specific performance forecast alongside your channel forecast.
              </p>
              <InputField
                label="Video Title"
                placeholder="e.g. The Best Laptops of 2026 — Full Breakdown"
                value={form.videoTitle}
                onChange={set('videoTitle')}
                optional
              />
              <TextareaField
                label="Description / Concept"
                placeholder="Brief description of the video concept, topics covered, and format..."
                value={form.videoDesc}
                onChange={set('videoDesc')}
                optional
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Planned Publish Date"
                  placeholder="YYYY-MM-DD"
                  value={form.videoDate}
                  onChange={set('videoDate')}
                  optional
                />
                <InputField
                  label="Format"
                  placeholder="e.g. Review, Tutorial, Vlog"
                  value={form.videoFormat}
                  onChange={set('videoFormat')}
                  optional
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: palette.text }}>Review & Submit</h2>
              <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
                Confirm your details and submit for AI analysis. We'll generate your report immediately.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { label: 'YouTube Channel', value: form.youtubeUrl, icon: Youtube },
                  { label: 'Instagram', value: form.instagram || '—', icon: Instagram },
                  { label: 'X / Twitter', value: form.twitter || '—', icon: Twitter },
                  { label: 'Upcoming Video', value: form.videoTitle || '—', icon: Video },
                ].map(item => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: palette.surfaceAlt }}
                  >
                    <item.icon size={14} style={{ color: palette.primary }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: palette.textSubtle }}>{item.label}</p>
                      <p className="text-sm font-medium truncate" style={{ color: palette.text }}>{item.value}</p>
                    </div>
                    <Check size={14} style={{ color: palette.success }} />
                  </div>
                ))}
              </div>

              <div
                className="mt-5 p-4 rounded-xl flex items-start gap-3"
                style={{ backgroundColor: `${palette.success}12`, border: `1px solid ${palette.success}30` }}
              >
                <Shield size={16} style={{ color: palette.success, marginTop: 1 }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: palette.success }}>Privacy Guarantee</p>
                  <p className="text-xs" style={{ color: palette.textMuted }}>
                    We only analyze publicly available data. No OAuth, no private credentials. Your channel data is never sold or shared.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: palette.surfaceAlt, color: palette.textMuted, border: `1px solid ${palette.border}` }}
            >
              Back
            </button>
          )}
          <button
            onClick={step < steps.length - 1 ? () => setStep(s => s + 1) : handleSubmit}
            disabled={!canProceed}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: canProceed ? palette.gradient : palette.surfaceAlt,
              color: canProceed ? palette.onPrimary : palette.textSubtle,
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}
          >
            {step < steps.length - 1 ? (
              <>Continue <ChevronRight size={16} /></>
            ) : (
              <><Zap size={16} /> Run AI Analysis</>
            )}
          </button>
        </div>

        {step === 0 && (
          <p className="text-center text-xs mt-3" style={{ color: palette.textSubtle }}>
            Takes under 2 minutes · No credit card required
          </p>
        )}
      </div>
    </div>
  );
}
