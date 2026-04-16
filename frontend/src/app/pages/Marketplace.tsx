import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth, loadUserProfile } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import { Search, SlidersHorizontal, ChevronRight, Star, Zap } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface MarketplaceCampaign {
  campaign_id: string;
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

const riskOrder: Record<string, number> = { Low: 0, 'Low-Med': 1, Medium: 2, High: 3 };

// ── Campaign Card ──────────────────────────────────────────────────────────────

function CampaignCard({ item, onClick }: { item: MarketplaceCampaign; onClick: () => void }) {
  const { palette } = useTheme();

  const riskColors: Record<string, string> = {
    Low: palette.success,
    'Low-Med': '#84CC16',
    Medium: palette.warning,
    High: palette.danger,
  };

  const pct = item.target_amount > 0
    ? Math.min(100, Math.round((item.raised_amount / item.target_amount) * 100))
    : 0;
  const riskColor = riskColors[item.risk_level] || palette.warning;
  const scoreColor = item.ai_score >= 80 ? palette.success : item.ai_score >= 70 ? palette.warning : item.ai_score >= 60 ? '#F97316' : palette.danger;

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-2xl"
      style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
      onClick={onClick}
    >
      {/* Image / thumbnail */}
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
            <span className="text-4xl font-black opacity-20" style={{ color: palette.primary }}>
              {item.creator_name?.[0] ?? '?'}
            </span>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${palette.surface} 0%, transparent 50%)` }}
        />
        {/* AI Score badge */}
        <div className="absolute top-3 left-3">
          <div
            className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}30` }}
          >
            <Star size={10} fill={scoreColor} strokeWidth={0} /> AI {item.ai_score}
          </div>
        </div>
        {/* Risk badge */}
        <div
          className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${riskColor}22`, color: riskColor, border: `1px solid ${riskColor}40` }}
        >
          {item.risk_level} Risk
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm truncate" style={{ color: palette.text }}>{item.creator_name}</h3>
            <p className="text-xs" style={{ color: palette.textMuted }}>{item.creator_handle}</p>
          </div>
          {item.genres[0] && (
            <span
              className="text-xs px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ml-2"
              style={{ backgroundColor: `${palette.primary}15`, color: palette.primaryLight }}
            >
              {item.genres[0]}
            </span>
          )}
        </div>

        {/* Metrics */}
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

        {/* Raise progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: palette.textMuted }}>Raise Progress</span>
            <span style={{ color: palette.text }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: palette.gradient }} />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span style={{ color: palette.textMuted }}>${item.raised_amount.toLocaleString()} raised</span>
            <span style={{ color: palette.textSubtle }}>{item.investor_count} {item.investor_count === 1 ? 'backer' : 'backers'}</span>
          </div>
        </div>

        {/* Returns */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs mb-0.5" style={{ color: palette.textMuted }}>Expected Return Range</p>
            <p className="font-bold text-sm" style={{ color: palette.success }}>{item.return_low}% to {item.return_high}%</p>
          </div>
          <button
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: palette.gradient, color: palette.onPrimary }}
          >
            View <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Marketplace ────────────────────────────────────────────────────────────────

export function Marketplace() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'growth' | 'risk'>('score');

  const userProfile = user ? loadUserProfile(user.email) : null;
  const preferredGenres = userProfile?.genres ?? [];

  useEffect(() => {
    callApi<MarketplaceCampaign[]>('listLiveCampaigns_Marketplace')
      .then(res => setCampaigns(res.data ?? []))
      .catch(() => setCampaigns([]));
    callApi<string[]>('getGenres_App')
      .then(res => setAllGenres(['All', ...(res.data ?? [])]))
      .catch(() => {});
  }, []);

  const filtered = campaigns
    .filter(c => selectedGenre === 'All' || c.genres.includes(selectedGenre))
    .filter(c =>
      !searchQuery ||
      c.creator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.creator_handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'score') return b.ai_score - a.ai_score;
      if (sortBy === 'growth') return parseInt(b.growth_rate) - parseInt(a.growth_rate);
      if (sortBy === 'risk') return (riskOrder[a.risk_level] ?? 2) - (riskOrder[b.risk_level] ?? 2);
      return 0;
    });

  // "For You" — campaigns that match user's preferred genres
  const forYou = preferredGenres.length > 0
    ? campaigns.filter(c => c.genres.some(g => preferredGenres.includes(g)))
    : [];

  const goToCampaign = (c: MarketplaceCampaign) => navigate(`/campaign/${c.campaign_id}`);

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: palette.text }}>Creator Marketplace</h1>
          <p style={{ color: palette.textMuted }}>
            Browse AI-underwritten campaigns and back the creators you believe in.
          </p>
        </div>

        {/* For You section */}
        {forYou.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} style={{ color: palette.accent }} />
              <h2 className="font-bold" style={{ color: palette.text }}>For You</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${palette.accent}18`, color: palette.accent }}>
                Based on your interests
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {forYou.slice(0, 3).map(c => (
                <CampaignCard key={c.campaign_id} item={c} onClick={() => goToCampaign(c)} />
              ))}
            </div>
          </div>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.textSubtle }} />
            <input
              type="text"
              placeholder="Search creators, genres..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}`, color: palette.text }}
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} style={{ color: palette.textMuted }} />
            <span className="text-sm" style={{ color: palette.textMuted }}>Sort:</span>
            {(['score', 'growth', 'risk'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className="text-xs px-3 py-1.5 rounded-lg capitalize"
                style={{
                  backgroundColor: sortBy === opt ? palette.primary : palette.surface,
                  color: sortBy === opt ? palette.onPrimary : palette.textMuted,
                  border: `1px solid ${sortBy === opt ? palette.primary : palette.border}`,
                }}
              >
                {opt === 'score' ? 'AI Score' : opt === 'growth' ? 'Growth' : 'Lowest Risk'}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {allGenres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className="text-sm px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                backgroundColor: selectedGenre === genre ? palette.primary : palette.surface,
                color: selectedGenre === genre ? palette.onPrimary : palette.textMuted,
                border: `1px solid ${selectedGenre === genre ? palette.primary : palette.border}`,
              }}
            >
              {genre}
              {preferredGenres.includes(genre) && <span className="ml-1 text-xs">★</span>}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
          Showing <span style={{ color: palette.text }}>{filtered.length}</span> campaign{filtered.length !== 1 ? 's' : ''}
          {selectedGenre !== 'All' && <span> in <strong>{selectedGenre}</strong></span>}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <CampaignCard key={c.campaign_id} item={c} onClick={() => goToCampaign(c)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold mb-2" style={{ color: palette.text }}>
              {campaigns.length === 0 ? 'No live campaigns yet' : 'No campaigns found'}
            </p>
            <p style={{ color: palette.textMuted }}>
              {campaigns.length === 0
                ? 'Be the first creator to launch a campaign!'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
