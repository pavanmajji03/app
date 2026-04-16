import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { creators } from '../data/mockData';
import {
  CheckCircle, Share2, Copy, TrendingUp, Users, DollarSign,
  ArrowRight, Eye, Zap, Star, Twitter, Linkedin, Link2,
} from 'lucide-react';

const creator = creators[0];

function ConfettiDots() {
  const dots = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 2,
    color: ['#8B3DFF', '#F5E642', '#4ADE80', '#B07FFF', '#F59E0B'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map(d => (
        <div
          key={d.id}
          className="absolute rounded-full opacity-60 animate-bounce"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            backgroundColor: d.color,
            animationDelay: `${d.delay}s`,
            animationDuration: `${1.5 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
}

export function CampaignLive() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const campaignUrl = `creatorbond.io/c/${creator.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${campaignUrl}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      label: 'Share on X',
      icon: Twitter,
      color: '#1DA1F2',
      href: `https://twitter.com/intent/tweet?text=I+just+launched+my+creator+investment+campaign+on+CreatorBond!+Back+my+channel+and+earn+performance-linked+returns.&url=https://${campaignUrl}`,
    },
    {
      label: 'Share on LinkedIn',
      icon: Linkedin,
      color: '#0A66C2',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=https://${campaignUrl}`,
    },
  ];

  const nextSteps = [
    {
      icon: Share2,
      title: 'Share your campaign',
      desc: 'Post your campaign link to your YouTube community, Instagram, X, and TikTok. The more eyes, the better.',
      cta: 'Copy Link',
      action: handleCopy,
    },
    {
      icon: TrendingUp,
      title: 'Keep creating content',
      desc: 'Your payouts are tied to your actual performance. Consistent uploads = higher returns for your investors.',
      cta: null,
      action: null,
    },
    {
      icon: Eye,
      title: 'Track your campaign',
      desc: 'Visit your creator dashboard anytime to monitor investors, raise progress, and monthly payout statements.',
      cta: 'View Dashboard',
      action: () => navigate('/creator'),
    },
  ];

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Success Hero */}
        <div
          className="rounded-3xl p-8 mb-8 text-center relative overflow-hidden"
          style={{ background: palette.gradient }}
        >
          <ConfettiDots />
          <div className="relative z-10">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: `${palette.onPrimary}20` }}
            >
              <CheckCircle size={40} style={{ color: palette.onPrimary }} />
            </div>

            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: `${palette.onPrimary}18`, color: palette.onPrimary }}
            >
              <Zap size={12} /> Campaign is LIVE
            </div>

            <h1 className="text-3xl font-black mb-2" style={{ color: palette.onPrimary }}>
              You're Live, {creator.name}! 🎉
            </h1>
            <p className="text-base max-w-md mx-auto" style={{ color: `${palette.onPrimary}cc` }}>
              Your campaign is now visible on the CreatorBond marketplace.
              Fans can browse, calculate payouts, and paper-invest right now.
            </p>
          </div>
        </div>

        {/* Campaign Stats Preview */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: `2px solid ${palette.primary}` }}
            >
              <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold" style={{ color: palette.text }}>{creator.name} · Season 1</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: `${palette.success}18`, color: palette.success }}
                >
                  LIVE
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>
                {creator.term} months · {creator.revenueShare}% revenue share
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg"
              style={{ backgroundColor: `${palette.success}18`, color: palette.success }}
            >
              <Star size={12} fill={palette.success} strokeWidth={0} />
              AI Score {creator.aiScore}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: 'Investors', value: '0', sub: 'Just launched', color: palette.primary },
              { icon: DollarSign, label: 'Raised', value: '$0', sub: `of $${creator.targetAmount.toLocaleString()}`, color: palette.accent },
              { icon: TrendingUp, label: 'Base Return', value: `+${creator.returnBase}%`, sub: `${creator.returnLow}–${creator.returnHigh}% range`, color: palette.success },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: palette.surfaceAlt }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: `${item.color}18` }}
                  >
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <p className="font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: palette.textSubtle }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: palette.textSubtle }}>{item.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Link */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <h3 className="font-bold mb-3" style={{ color: palette.text }}>Your Campaign Link</h3>
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
          >
            <Link2 size={16} style={{ color: palette.textSubtle }} />
            <span className="flex-1 text-sm font-mono" style={{ color: palette.textMuted }}>
              {campaignUrl}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: copied ? `${palette.success}18` : palette.gradient,
                color: copied ? palette.success : palette.onPrimary,
                border: copied ? `1px solid ${palette.success}40` : 'none',
              }}
            >
              {copied ? (
                <><CheckCircle size={12} /> Copied!</>
              ) : (
                <><Copy size={12} /> Copy</>
              )}
            </button>
          </div>

          <div className="flex gap-3 mt-3">
            {shareLinks.map(link => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ backgroundColor: `${link.color}18`, color: link.color, border: `1px solid ${link.color}30` }}
                >
                  <Icon size={14} />
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h3 className="font-bold mb-4" style={{ color: palette.text }}>Next Steps</h3>
          <div className="flex flex-col gap-3">
            {nextSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${palette.primary}18` }}
                  >
                    <Icon size={18} style={{ color: palette.primary }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
                      >
                        {i + 1}
                      </span>
                      <p className="font-semibold text-sm" style={{ color: palette.text }}>{step.title}</p>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: palette.textMuted }}>{step.desc}</p>
                  </div>
                  {step.cta && step.action && (
                    <button
                      onClick={step.action}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0"
                      style={{ backgroundColor: `${palette.primary}18`, color: palette.primary, border: `1px solid ${palette.primary}30` }}
                    >
                      {step.cta}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fan CTA */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
        >
          <p className="text-sm mb-3" style={{ color: palette.textMuted }}>
            Want to see what fans experience when they visit your campaign?
          </p>
          <button
            onClick={() => navigate('/creator')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: palette.gradient, color: palette.onPrimary }}
          >
            View Fan Page <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
