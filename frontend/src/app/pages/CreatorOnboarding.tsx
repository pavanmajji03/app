import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import type { OnboardingConfig } from '../data/mockData';
import { PlayCircle, AtSign, Video, ChevronRight, Check, Zap, Shield, TrendingUp, Link } from 'lucide-react';

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  const { palette } = useTheme();
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                backgroundColor: idx <= current ? palette.primary : palette.surfaceAlt,
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
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<OnboardingConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    youtubeUrl: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    videoTitle: '',
    videoDesc: '',
    videoDate: '',
    videoFormat: '',
  });

  useEffect(() => {
    callApi<OnboardingConfig>('getOnboardingConfig_CreatorOnboarding').then(async res => {
      setConfig(res.data);

      // 1. Try DB via saved creator_id
      const creatorId = user?.email ? localStorage.getItem(`fanfolio_creator_id_${user.email}`) : null;
      if (creatorId) {
        try {
          const formRes = await callApi<{
            youtube_url: string | null;
            instagram_username: string | null;
            twitter_handle: string | null;
            tiktok_handle: string | null;
            linkedin_url: string | null;
          }>('getCreatorForm_CreatorOnboarding', { pathParams: { creator_id: creatorId } });
          const d = formRes.data;
          if (d.youtube_url) {
            setForm(f => ({
              ...f,
              youtubeUrl: d.youtube_url ?? '',
              instagram: d.instagram_username ?? '',
              twitter: d.twitter_handle ?? '',
              tiktok: d.tiktok_handle ?? '',
              linkedin: d.linkedin_url ?? '',
            }));
            return;
          }
        } catch {}
      }

      // 2. Fallback: localStorage cache (saved on last submit)
      const cached = user?.email ? localStorage.getItem(`fanfolio_form_cache_${user.email}`) : null;
      if (cached) {
        try {
          const f = JSON.parse(cached);
          if (f.youtubeUrl) { setForm(prev => ({ ...prev, ...f })); return; }
        } catch {}
      }

      // 3. Default empty form
      setForm({ ...res.data.defaultForm, linkedin: res.data.defaultForm.linkedin ?? '' });
    });
  }, [user]);

  if (!config) return null;

  const steps = config.steps;
  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));
  const canProceed = step === 0 ? form.youtubeUrl.length > 0 : true;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await callApi<{ analysis_id: string; creator_id: string; status: string }>(
        'analyzeCreator_CreatorOnboarding',
        {
          payload: {
            channel_input: form.youtubeUrl,
            instagram_username: form.instagram || null,
            twitter_handle: form.twitter || null,
            tiktok_handle: form.tiktok || null,
            linkedin_url: form.linkedin || null,
          },
        }
      );
      sessionStorage.setItem('fanfolio_analysis_id', res.data.analysis_id);
      sessionStorage.removeItem('fanfolio_anim_done'); // always play animation fresh for new submission
      // Persist so login-refresh can resume polling at /analysis
      if (user?.email) {
        localStorage.setItem(`fanfolio_analysis_id_${user.email}`, res.data.analysis_id);
        localStorage.setItem(`fanfolio_creator_id_${user.email}`, res.data.creator_id);
        // Cache form values so pre-population works even if DB record has no fields yet
        localStorage.setItem(`fanfolio_form_cache_${user.email}`, JSON.stringify({
          youtubeUrl: form.youtubeUrl,
          instagram: form.instagram,
          twitter: form.twitter,
          tiktok: form.tiktok,
          linkedin: form.linkedin,
        }));
      }
      navigate('/analysis');
    } catch {
      setSubmitError('Could not reach the analysis server. Please try again.');
      setSubmitting(false);
    }
  };

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

        <StepIndicator current={step} steps={steps} />

        {/* Form Card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          {/* Step 0: YouTube Channel */}
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
                icon={PlayCircle}
                hint="We'll automatically pull public channel data — subscribers, views, upload history, etc."
              />
              <div
                className="mt-5 rounded-xl p-4"
                style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
              >
                <p className="text-xs font-semibold mb-3" style={{ color: palette.text }}>What we automatically analyze:</p>
                <div className="grid grid-cols-2 gap-2">
                  {config.analysisChecklist.map(item => (
                    <div key={item} className="flex items-center gap-1.5">
                      <Check size={11} style={{ color: palette.success }} />
                      <span className="text-xs" style={{ color: palette.textMuted }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Social Links */}
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
                icon={AtSign}
                optional
              />
              <InputField
                label="X / Twitter"
                placeholder="@yourusername"
                value={form.twitter}
                onChange={set('twitter')}
                icon={AtSign}
                optional
              />
              <InputField
                label="LinkedIn"
                placeholder="https://linkedin.com/in/yourprofile"
                value={form.linkedin}
                onChange={set('linkedin')}
                icon={Link}
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

          {/* Step 2: Upcoming Video */}
          {step === 2 && (
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: palette.text }}>Upcoming Video (Optional)</h2>
              <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
                Share your next video details for a video-specific performance forecast alongside your channel forecast.
              </p>
              <InputField
                label="Video Title"
                placeholder="e.g. Why Indian Startups Are Unprofitable | KATA 6"
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

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 className="font-bold text-lg mb-1" style={{ color: palette.text }}>Review & Submit</h2>
              <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
                Confirm your details and submit for AI analysis. We'll generate your report immediately.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { label: 'YouTube Channel', value: form.youtubeUrl,           icon: PlayCircle },
                  { label: 'Instagram',        value: form.instagram || '—',    icon: AtSign },
                  { label: 'X / Twitter',      value: form.twitter || '—',      icon: AtSign },
                  { label: 'LinkedIn',         value: form.linkedin || '—',     icon: Link },
                  { label: 'TikTok',           value: form.tiktok || '—',       icon: Video },
                  { label: 'Upcoming Video',   value: form.videoTitle || '—',   icon: PlayCircle },
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
              disabled={submitting}
              className="px-5 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: palette.surfaceAlt, color: palette.textMuted, border: `1px solid ${palette.border}` }}
            >
              Back
            </button>
          )}
          <button
            onClick={step < steps.length - 1 ? () => setStep(s => s + 1) : handleSubmit}
            disabled={!canProceed || submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: canProceed && !submitting ? palette.gradient : palette.surfaceAlt,
              color: canProceed && !submitting ? palette.onPrimary : palette.textSubtle,
              cursor: canProceed && !submitting ? 'pointer' : 'not-allowed',
            }}
          >
            {step < steps.length - 1 ? (
              <>Continue <ChevronRight size={16} /></>
            ) : submitting ? (
              <><Zap size={16} className="animate-pulse" /> Starting Analysis...</>
            ) : (
              <><Zap size={16} /> Run AI Analysis</>
            )}
          </button>
        </div>

        {submitError && (
          <p className="text-center text-xs mt-3 font-medium" style={{ color: palette.danger }}>
            {submitError}
          </p>
        )}

        {step === 0 && !submitError && (
          <p className="text-center text-xs mt-3" style={{ color: palette.textSubtle }}>
            Takes under 2 minutes · No credit card required
          </p>
        )}
      </div>
    </div>
  );
}
