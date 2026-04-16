import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth, loadUserProfile } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import { Star, Zap, Search, GitCompare, TrendingUp, Users, ChevronRight } from 'lucide-react';

interface Campaign {
  campaign_id: string;
  analysis_id?: string | null;
  creator_name: string;
  creator_handle: string;
  creator_thumbnail: string;
  ai_score: number;
  risk_level: string;
  genres: string[];
  niche: string;
  subscribers: string;
  avg_views: string;
  growth_rate: string;
  term_months: number;
  revenue_share_pct: number;
  target_amount: number;
  raised_amount: number;
  investor_count: number;
  return_low: number;
  return_base: number;
  return_high: number;
}

function scoreColor(score: number, palette: any) {
  return score >= 80 ? palette.success : score >= 70 ? palette.warning : score >= 60 ? '#F97316' : palette.danger;
}

function riskColor(level: string, palette: any) {
  return ({ Low: palette.success, 'Low-Med': '#84CC16', Medium: palette.warning, High: palette.danger } as any)[level] || palette.warning;
}

function CreatorCard({ item, onClick }: { item: Campaign; onClick: () => void }) {
  const { palette } = useTheme();
  const sc = scoreColor(item.ai_score, palette);
  const rc = riskColor(item.risk_level, palette);

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-2xl"
      style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden" style={{ backgroundColor: `${palette.primary}22` }}>
        {item.creator_thumbnail ? (
          <img
            src={item.creator_thumbnail}
            alt={item.creator_name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-black opacity-20" style={{ color: palette.primary }}>{item.creator_name?.[0] ?? '?'}</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${palette.surface} 0%, transparent 50%)` }} />
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}18`, color: sc, border: `1px solid ${sc}30` }}>
            <Star size={10} fill={sc} strokeWidth={0} /> AI {item.ai_score}
          </div>
        </div>
        <div className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rc}22`, color: rc, border: `1px solid ${rc}40` }}>
          {item.risk_level} Risk
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm truncate" style={{ color: palette.text }}>{item.creator_name}</h3>
            <p className="text-xs" style={{ color: palette.textMuted }}>{item.creator_handle}</p>
          </div>
          {item.genres[0] && (
            <span className="text-xs px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ml-2" style={{ backgroundColor: `${palette.primary}15`, color: palette.primaryLight }}>
              {item.genres[0]}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 py-3" style={{ borderTop: `1px solid ${palette.border}`, borderBottom: `1px solid ${palette.border}` }}>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: palette.text }}>{item.subscribers || '—'}</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Subs</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: palette.text }}>{item.avg_views || '—'}</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Avg Views</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: palette.success }}>{item.growth_rate || '—'}</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Growth</p>
          </div>
        </div>

        {item.niche && (
          <p className="text-xs mb-2" style={{ color: palette.textSubtle }}>{item.niche}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs mb-0.5" style={{ color: palette.textMuted }}>Genres</p>
            <div className="flex gap-1 flex-wrap">
              {item.genres.slice(0, 2).map(g => (
                <span key={g} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${palette.primary}12`, color: palette.textMuted }}>{g}</span>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: palette.gradient, color: palette.onPrimary }}>
            View Report <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrandLanding() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const profile = user ? loadUserProfile(user.email) : null;
  const brandGenres = profile?.genres ?? [];

  useEffect(() => {
    callApi<Campaign[]>('listLiveCampaigns_Marketplace')
      .then(res => setCampaigns(res.data ?? []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  // Only creators with AI reports in DB (have analysis_id)
  const withReports = campaigns.filter(c => !!c.analysis_id);

  // "For You" — genre overlap with brand's selected genres, sorted by AI score
  const forYou = brandGenres.length > 0
    ? withReports
        .filter(c => c.genres.some(g => brandGenres.includes(g)))
        .sort((a, b) => b.ai_score - a.ai_score)
    : [];

  const forYouIds = new Set(forYou.map(c => c.campaign_id));

  // Rest — all other creators with AI reports, sorted by AI score
  const rest = withReports
    .filter(c => !forYouIds.has(c.campaign_id))
    .sort((a, b) => b.ai_score - a.ai_score);

  const goToReport = (c: Campaign) => {
    if (c.analysis_id) navigate(`/brand-report?analysis_id=${c.analysis_id}`);
  };

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏢</span>
            <h1 className="text-3xl font-bold" style={{ color: palette.text }}>
              Brand Discovery Hub
            </h1>
          </div>
          <p className="text-sm mb-4" style={{ color: palette.textMuted }}>
            {user?.name ? `Welcome, ${user.name.split(' ')[0]}! ` : ''}
            Explore AI-analyzed creators and find the perfect brand partnership match.
          </p>

          {/* Quick actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate('/creator-search')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: palette.gradient, color: palette.onPrimary }}
            >
              <Search size={14} /> Find Creators
            </button>
            <button
              onClick={() => navigate('/creator-comparison')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: palette.surface, color: palette.text, border: `1px solid ${palette.border}` }}
            >
              <GitCompare size={14} /> Compare Creators
            </button>
          </div>
        </div>

        {/* Brand genres chip display */}
        {brandGenres.length > 0 && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: palette.textMuted }}>Your brand categories:</span>
            {brandGenres.map(g => (
              <span key={g} className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${palette.primary}20`, color: palette.primary, border: `1px solid ${palette.primary}40` }}>
                {g}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2" style={{ color: palette.textMuted }}>
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${palette.primary}40`, borderTopColor: palette.primary }} />
            <span className="text-sm">Loading creator reports…</span>
          </div>
        ) : (
          <>
            {/* For You section */}
            {forYou.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} style={{ color: palette.accent }} />
                  <h2 className="font-bold text-lg" style={{ color: palette.text }}>For You</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${palette.accent}18`, color: palette.accent }}>
                    Based on your brand interests
                  </span>
                </div>
                <p className="text-xs mb-5" style={{ color: palette.textMuted }}>
                  Creators whose niche matches your brand categories — sorted by AI investability score
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {forYou.map(c => (
                    <CreatorCard key={c.campaign_id} item={c} onClick={() => goToReport(c)} />
                  ))}
                </div>
              </div>
            )}

            {/* All other creators */}
            {rest.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} style={{ color: palette.primary }} />
                  <h2 className="font-bold text-lg" style={{ color: palette.text }}>
                    {forYou.length > 0 ? 'All Other Creators' : 'Creators with AI Reports'}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${palette.primary}12`, color: palette.textMuted }}>
                    {rest.length} available
                  </span>
                </div>
                <p className="text-xs mb-5" style={{ color: palette.textMuted }}>
                  All creators with verified AI analysis — sorted by investability score
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {rest.map(c => (
                    <CreatorCard key={c.campaign_id} item={c} onClick={() => goToReport(c)} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {withReports.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🏢</div>
                <p className="text-lg font-semibold mb-2" style={{ color: palette.text }}>No creator reports yet</p>
                <p className="text-sm" style={{ color: palette.textMuted }}>
                  Check back soon as creators complete their AI analysis.
                </p>
              </div>
            )}

            {/* No genre match but creators exist */}
            {brandGenres.length === 0 && withReports.length > 0 && (
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: `${palette.primary}10`, border: `1px solid ${palette.primary}30` }}>
                <p className="text-sm" style={{ color: palette.textMuted }}>
                  <span style={{ color: palette.primary }}>Tip:</span> Set your brand categories in your profile to see personalized creator recommendations.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
