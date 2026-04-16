import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { callApi } from '../services/apiService';
import { Search, Star, X, ChevronRight, Filter } from 'lucide-react';

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

function CreatorRow({ item, onClick }: { item: Campaign; onClick: () => void }) {
  const { palette } = useTheme();
  const sc = scoreColor(item.ai_score, palette);
  const rc = riskColor(item.risk_level, palette);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: `${palette.primary}22` }}>
        {item.creator_thumbnail ? (
          <img src={item.creator_thumbnail} alt={item.creator_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-black opacity-30" style={{ color: palette.primary }}>
            {item.creator_name?.[0] ?? '?'}
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-sm truncate" style={{ color: palette.text }}>{item.creator_name}</h3>
          {item.niche && <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${palette.primary}12`, color: palette.textMuted }}>{item.niche}</span>}
        </div>
        <p className="text-xs mb-1" style={{ color: palette.textMuted }}>{item.creator_handle}</p>
        <div className="flex gap-1 flex-wrap">
          {item.genres.slice(0, 3).map(g => (
            <span key={g} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${palette.primary}10`, color: palette.textSubtle }}>{g}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:grid grid-cols-3 gap-4 flex-shrink-0">
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

      {/* AI Score + Risk */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sc}18`, color: sc, border: `1px solid ${sc}30` }}>
          <Star size={10} fill={sc} strokeWidth={0} /> {item.ai_score}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rc}18`, color: rc }}>{item.risk_level}</span>
      </div>

      <ChevronRight size={16} style={{ color: palette.textSubtle, flexShrink: 0 }} />
    </div>
  );
}

export function CreatorSearch() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      callApi<Campaign[]>('listLiveCampaigns_Marketplace'),
      callApi<string[]>('getGenres_App'),
    ]).then(([campRes, genreRes]) => {
      setCampaigns(campRes.data ?? []);
      setAllGenres(genreRes.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleGenre = (g: string) =>
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const clearGenres = () => setSelectedGenres([]);

  // Only creators with AI reports
  const withReports = useMemo(() => campaigns.filter(c => !!c.analysis_id), [campaigns]);

  const filtered = useMemo(() => {
    return withReports
      .filter(c => {
        // Genre filter — OR logic: creator matches ANY selected genre
        if (selectedGenres.length > 0 && !c.genres.some(g => selectedGenres.includes(g))) return false;
        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            c.creator_name.toLowerCase().includes(q) ||
            c.creator_handle.toLowerCase().includes(q) ||
            c.niche?.toLowerCase().includes(q) ||
            c.genres.some(g => g.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => b.ai_score - a.ai_score);
  }, [withReports, selectedGenres, searchQuery]);

  const goToReport = (c: Campaign) => {
    if (c.analysis_id) navigate(`/brand-report?analysis_id=${c.analysis_id}`);
  };

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: palette.text }}>Find Creators</h1>
          <p className="text-sm" style={{ color: palette.textMuted }}>
            Search and filter creators with AI-verified reports. Select a creator to view their full analysis.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: palette.textSubtle }} />
          <input
            type="text"
            placeholder="Search by name, handle, niche, or genre…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm outline-none"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}`, color: palette.text }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: palette.textSubtle }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Genre pills — multi-select */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={13} style={{ color: palette.textSubtle }} />
            <span className="text-xs font-semibold" style={{ color: palette.textMuted }}>Filter by genre (multi-select)</span>
            {selectedGenres.length > 0 && (
              <button
                onClick={clearGenres}
                className="text-xs px-2 py-0.5 rounded-full ml-1"
                style={{ backgroundColor: `${palette.danger}18`, color: palette.danger }}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allGenres.map(g => {
              const on = selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={{
                    backgroundColor: on ? palette.primary : palette.surface,
                    color: on ? palette.onPrimary : palette.textMuted,
                    border: `1px solid ${on ? palette.primary : palette.border}`,
                  }}
                >
                  {on && <span className="mr-1">✓</span>}{g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm mb-4" style={{ color: palette.textMuted }}>
            <span style={{ color: palette.text }}>{filtered.length}</span> creator{filtered.length !== 1 ? 's' : ''} found
            {selectedGenres.length > 0 && <span style={{ color: palette.primary }}> · filtered by {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''}</span>}
            <span className="ml-2 text-xs" style={{ color: palette.textSubtle }}>— sorted by AI score</span>
          </p>
        )}

        {/* Creator list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2" style={{ color: palette.textMuted }}>
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${palette.primary}40`, borderTopColor: palette.primary }} />
            <span className="text-sm">Loading creators…</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map(c => (
              <CreatorRow key={c.campaign_id} item={c} onClick={() => goToReport(c)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold mb-2" style={{ color: palette.text }}>
              {withReports.length === 0 ? 'No creator reports available yet' : 'No creators match your filters'}
            </p>
            <p className="text-sm" style={{ color: palette.textMuted }}>
              {withReports.length === 0 ? 'Check back soon!' : 'Try different genres or clear the search'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
