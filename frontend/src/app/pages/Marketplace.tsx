import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { creators } from '../data/mockData';
import { Search, SlidersHorizontal, TrendingUp, Users, ChevronRight, Star } from 'lucide-react';

const categories = ['All', 'Tech Reviews', 'Lifestyle', 'Science & Education', 'Food & Cooking', 'Fitness & Health', 'Finance'];

const riskOrder = { Low: 0, 'Low-Med': 1, Medium: 2, High: 3 };

function AIScoreBadge({ score }: { score: number }) {
  const { palette } = useTheme();
  const color = score >= 80 ? palette.success : score >= 70 ? palette.warning : score >= 60 ? '#F97316' : palette.danger;
  return (
    <div
      className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}18`, color }}
    >
      <Star size={10} fill={color} strokeWidth={0} />
      AI {score}
    </div>
  );
}

function CreatorCard({ creator, onClick }: { creator: typeof creators[0]; onClick: () => void }) {
  const { palette } = useTheme();

  const riskColors: Record<string, string> = {
    Low: palette.success,
    'Low-Med': '#84CC16',
    Medium: palette.warning,
    High: palette.danger,
  };

  const pct = Math.round((creator.raisedAmount / creator.targetAmount) * 100);
  const riskColor = riskColors[creator.riskLevel] || palette.warning;

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-2xl"
      style={{
        backgroundColor: palette.surface,
        border: `1px solid ${palette.border}`,
      }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={creator.image}
          alt={creator.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${palette.surface} 0%, transparent 50%)` }}
        />
        <div className="absolute top-3 left-3">
          <AIScoreBadge score={creator.aiScore} />
        </div>
        <div
          className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${riskColor}22`, color: riskColor, border: `1px solid ${riskColor}40` }}
        >
          {creator.riskLevel} Risk
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm" style={{ color: palette.text }}>{creator.name}</h3>
            <p className="text-xs" style={{ color: palette.textMuted }}>{creator.handle}</p>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0"
            style={{ backgroundColor: `${palette.primary}15`, color: palette.primaryLight }}
          >
            {creator.category}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3 py-3" style={{ borderTop: `1px solid ${palette.border}`, borderBottom: `1px solid ${palette.border}` }}>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: palette.text }}>{creator.subscribers}</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Subs</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: palette.text }}>{creator.avgViews}</p>
            <p className="text-xs" style={{ color: palette.textSubtle }}>Avg Views</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: palette.success }}>{creator.growthRate}</p>
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
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: palette.gradient }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span style={{ color: palette.textMuted }}>${creator.raisedAmount.toLocaleString()} raised</span>
            <span style={{ color: palette.textSubtle }}>{creator.investorCount} investors</span>
          </div>
        </div>

        {/* Returns */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: palette.textMuted }}>Projected return</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xs" style={{ color: palette.textSubtle }}>+{creator.returnLow}%</span>
              <span className="font-bold text-sm" style={{ color: palette.success }}>+{creator.returnBase}%</span>
              <span className="text-xs" style={{ color: palette.textSubtle }}>+{creator.returnHigh}%</span>
            </div>
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

export function Marketplace() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'growth' | 'risk'>('score');

  const filtered = creators
    .filter(c => selectedCategory === 'All' || c.category === selectedCategory)
    .filter(c =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'score') return b.aiScore - a.aiScore;
      if (sortBy === 'growth') return parseInt(b.growthRate) - parseInt(a.growthRate);
      if (sortBy === 'risk') return (riskOrder[a.riskLevel as keyof typeof riskOrder] ?? 2) - (riskOrder[b.riskLevel as keyof typeof riskOrder] ?? 2);
      return 0;
    });

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: palette.text }}>Creator Marketplace</h1>
          <p style={{ color: palette.textMuted }}>
            Browse AI-underwritten campaigns and find your next creator investment.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: palette.textSubtle }}
            />
            <input
              type="text"
              placeholder="Search creators, categories, tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                color: palette.text,
              }}
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

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="text-sm px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                backgroundColor: selectedCategory === cat ? palette.primary : palette.surface,
                color: selectedCategory === cat ? palette.onPrimary : palette.textMuted,
                border: `1px solid ${selectedCategory === cat ? palette.primary : palette.border}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm mb-5" style={{ color: palette.textMuted }}>
          Showing <span style={{ color: palette.text }}>{filtered.length}</span> campaigns
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(creator => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onClick={() => navigate('/creator')}
            />
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg font-semibold mb-2" style={{ color: palette.text }}>No creators found</p>
            <p style={{ color: palette.textMuted }}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
