import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import { getStoredReport } from '../utils/reportUtils';
import type { Creator } from '../data/mockData';
import {
  CheckCircle, Share2, Copy, TrendingUp, Users, DollarSign,
  ArrowRight, Eye, Zap, Star, Twitter, Linkedin, Link2, RefreshCw,
} from 'lucide-react';

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

interface LiveCampaign {
  campaign_id: string;
  creator_id: string;
  term_months: number;
  revenue_share_pct: number;
  target_amount: number;
  raised_amount: number;
  investor_count: number;
  return_base: number;
  return_low: number;
  return_high: number;
  start_date: string | null;
}

export function CampaignLive() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [campaign, setCampaign] = useState<LiveCampaign | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const campaignIdRef = useRef<string | null>(null);

  const fetchCampaign = async (id: string, silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await callApi<LiveCampaign>('getCampaign_CampaignLive', { pathParams: { campaign_id: id } });
      setCampaign(res.data);
    } catch {
      // Campaign not found (e.g. stale ID after DB reset) — clear the stale reference
      sessionStorage.removeItem('fanfolio_campaign_id');
      if (user?.email) localStorage.removeItem(`fanfolio_campaign_id_${user.email}`);
      campaignIdRef.current = null;
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Try real report first, fall back to mock creator for display fields
    const stored = getStoredReport(user?.email);
    if (stored) {
      setCreator(prev => ({
        ...(prev ?? {} as Creator),
        name: stored.channelName,
        handle: stored.handle,
        image: stored.thumbnailUrl ?? (prev?.image ?? ''),
        aiScore: stored.aiScore,
      } as Creator));
    } else {
      callApi<Creator[]>('getCreator_CampaignLive').then(res => setCreator(res.data[0]));
    }

    // Resolve campaign_id: sessionStorage first, then localStorage (returning creator)
    const campaignId =
      sessionStorage.getItem('fanfolio_campaign_id') ||
      (user?.email ? localStorage.getItem(`fanfolio_campaign_id_${user.email}`) : null);

    if (campaignId && campaignId !== 'undefined') {
      campaignIdRef.current = campaignId;
      sessionStorage.setItem('fanfolio_campaign_id', campaignId);
      fetchCampaign(campaignId, true);

      // Auto-refresh every 30 seconds to show latest investor count
      const interval = setInterval(() => fetchCampaign(campaignId, true), 30_000);
      return () => clearInterval(interval);
    } else {
      // Clear any 'undefined' string that may have been stored
      sessionStorage.removeItem('fanfolio_campaign_id');
      if (user?.email) localStorage.removeItem(`fanfolio_campaign_id_${user.email}`);
    }
  }, [user]);

  if (!creator) return null;

  // Merge: real campaign data takes precedence over mock creator fields
  const term = campaign?.term_months ?? creator.term;
  const revenueShare = campaign?.revenue_share_pct ?? creator.revenueShare;
  const targetAmount = campaign?.target_amount ?? creator.targetAmount ?? 0;
  const raisedAmount = campaign?.raised_amount ?? creator.raisedAmount ?? 0;
  const returnBase = campaign?.return_base ?? creator.returnBase ?? 0;
  const returnLow = campaign?.return_low ?? creator.returnLow ?? 0;
  const returnHigh = campaign?.return_high ?? creator.returnHigh ?? 0;
  const investorCount = campaign?.investor_count ?? creator.investorCount;
  const campaignId = campaign?.campaign_id ?? null;

  const baseUrl = window.location.origin;
  const campaignUrl = campaignId ? `${baseUrl}/campaign/${campaignId}` : null;

  const handleCopy = () => {
    if (!campaignUrl) return;
    navigator.clipboard.writeText(campaignUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = campaignUrl ? [
    {
      label: 'Share on X',
      icon: Twitter,
      color: '#1DA1F2',
      href: `https://twitter.com/intent/tweet?text=I+just+launched+my+creator+backing+campaign!+Back+my+channel+and+earn+performance-linked+returns.&url=${encodeURIComponent(campaignUrl)}`,
    },
    {
      label: 'Share on LinkedIn',
      icon: Linkedin,
      color: '#0A66C2',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`,
    },
  ] : [];

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
      desc: 'Your payouts are tied to your actual performance. Consistent uploads = higher returns for your backers.',
      cta: null,
      action: null,
    },
    {
      icon: Eye,
      title: 'View AI Underwriting Report',
      desc: 'Review your full AI analysis — forecast, revenue scenarios, risk factors, and channel signals.',
      cta: 'View Report',
      action: () => navigate('/report'),
    },
    {
      icon: Star,
      title: 'Track your campaign',
      desc: 'Visit your creator dashboard anytime to monitor backers, raise progress, and monthly payout statements.',
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
              Fans can browse, calculate payouts, and back you right now.
            </p>
          </div>
        </div>

        {/* Campaign Stats Preview */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: palette.textMuted }}>Live Stats</p>
            <button
              onClick={() => campaignIdRef.current && fetchCampaign(campaignIdRef.current)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity"
              style={{ color: palette.textMuted, backgroundColor: palette.surfaceAlt }}
              title="Refresh stats"
            >
              <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: `2px solid ${palette.primary}` }}
            >
              <img src={creator.image} alt={creator.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
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
                {term} months · {revenueShare}% revenue share
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
              { icon: Users, label: 'Backers', value: `${investorCount}`, sub: investorCount === 0 ? 'Just launched' : `${investorCount} backer${investorCount !== 1 ? 's' : ''}`, color: palette.primary },
              { icon: DollarSign, label: 'Raised', value: `$${raisedAmount.toLocaleString()}`, sub: `of $${targetAmount.toLocaleString()}`, color: palette.accent },
              { icon: TrendingUp, label: 'Base Return', value: `+${returnBase}%`, sub: `${returnLow}–${returnHigh}% range`, color: palette.success },
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
          {!campaignUrl && (
            <p className="text-xs mb-3" style={{ color: palette.textMuted }}>
              Campaign link will appear here once your campaign is confirmed live.
            </p>
          )}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}
          >
            <Link2 size={16} style={{ color: palette.textSubtle }} />
            <span className="flex-1 text-sm font-mono" style={{ color: palette.textMuted }}>
              {campaignUrl ?? 'Pending...'}
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
