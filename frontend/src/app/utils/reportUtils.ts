/**
 * Reads the stored AI analysis report from sessionStorage (falling back to
 * localStorage keyed by email) and returns the fields needed by campaign pages.
 *
 * Returns null if no report is found.
 */
export interface StoredReportSummary {
  channelName: string;
  handle: string;
  thumbnailUrl: string | null;
  subscribers: string;
  avgViews: string;
  growthRate: string;
  aiScore: number;
  aiScoreLabel: string;
  niche: string;
  location: string;
  totalViews: string;
  engagementRate: string;
  uploadFreq: string;
  description: string;
  tags: string[];
  platforms: string[];
  recentVideos: { title: string; views: string; daysAgo: number; thumbnail?: string }[];
  // Revenue scenario for 180-day base case — used by CampaignSetup for raise target
  baseAdSenseStr: string; // e.g. "$12,400"
  // View forecast in millions — now includes 365d
  forecastLowM:  { d30: number; d90: number; d180: number; d365: number };
  forecastBaseM: { d30: number; d90: number; d180: number; d365: number };
  forecastHighM: { d30: number; d90: number; d180: number; d365: number };
  // Revenue scenarios by campaign term
  revenueScenarios: {
    '90d':  { low: string; base: string; high: string };
    '180d': { low: string; base: string; high: string };
    '365d': { low: string; base: string; high: string };
  };
  // Risk factors (0-100 scores)
  riskFactors: {
    growthTrend: number;
    cadenceReliability: number;
    platformDiversification: number;
    volatility: number;
    concentrationRisk: number;
  };
  // AI assessment
  aiAssessmentNarrative: string;
  strengths: string[];
  watchFactors: string[];
  estimatedMonthlyIncome: string;
}

export function getStoredReport(userEmail?: string | null): StoredReportSummary | null {
  const raw: string | null =
    sessionStorage.getItem('fanfolio_report') ||
    (userEmail ? localStorage.getItem(`fanfolio_creator_report_${userEmail}`) : null);

  if (!raw) return null;

  try {
    const report = JSON.parse(raw);
    const r = report?.ai_underwriting_report ?? {};

    // Support both old and new field names
    const forecast = report?.view_forecast_millions ?? report?.view_forecast_millions_180_days ?? {};
    const revScenarios = report?.revenue_scenarios_adsense ?? report?.revenue_scenarios_ypp ?? {};
    const oldRevenue = report?.revenue_scenarios_180_days_youtube_only ?? {};
    const risk = report?.risk_factor_analysis ?? {};

    const fLow  = forecast.low_conservative ?? {};
    const fBase = forecast.base_expected ?? {};
    const fHigh = forecast.high_optimistic ?? {};

    const pickRev = (term: string, scenario: string): string => {
      const s = revScenarios[term]?.[scenario];
      return s?.estimated_revenue ?? s?.estimated_adSense ?? '$0';
    };

    // Fallback base revenue from old field
    const fallbackBase = oldRevenue.base_expected?.estimated_adSense
      ?? oldRevenue.base_expected?.estimated_revenue
      ?? '$0';

    const ytSignals = report?.youtube_signals ?? {};
    const socialSignals = report?.social_signals ?? {};
    const trendingTopics = report?.trending_topics_analysis ?? {};
    const aiAssessment = report?.ai_assessment_summary ?? {};

    // Derive platforms from social signals presence
    const platforms: string[] = ['YouTube'];
    if (socialSignals.instagram) platforms.push('Instagram');
    if (socialSignals.twitter_x) platforms.push('X');
    if (socialSignals.linkedin) platforms.push('LinkedIn');

    // Tags: trending topics or niche split
    const rawTopics: string[] = trendingTopics.top_trending_topics ?? [];
    const tags = rawTopics.length > 0
      ? rawTopics.slice(0, 6)
      : (r.niche ?? '').split('•').map((t: string) => t.trim()).filter(Boolean);

    // Recent videos preview
    const rawVideos: any[] = ytSignals.recent_videos_preview ?? [];
    const recentVideos = rawVideos.map((v: any) => ({
      title: v.title ?? '',
      views: v.views ?? '0',
      daysAgo: v.days_ago ?? 0,
      thumbnail: v.thumbnail ?? undefined,
    }));

    // Description: narrative from AI assessment
    const narrative: string = aiAssessment.narrative ?? '';

    return {
      channelName: r.channel_name ?? 'Creator',
      handle: r.handle ?? '',
      thumbnailUrl: r.thumbnail_url ?? null,
      subscribers: r.subscribers ?? '',
      avgViews: r.avg_views ?? '',
      growthRate: r.growth_rate ?? '',
      aiScore: r.ai_score ?? 0,
      aiScoreLabel: r.ai_score_label ?? '',
      niche: r.niche ?? '',
      location: r.location ?? '',
      totalViews: r.total_views ?? ytSignals.total_views ?? '',
      engagementRate: ytSignals.engagement_rate ?? '',
      uploadFreq: ytSignals.cadence ?? '',
      description: narrative,
      tags,
      platforms,
      recentVideos,
      baseAdSenseStr: pickRev('180d', 'base') !== '$0' ? pickRev('180d', 'base') : fallbackBase,
      forecastLowM:  { d30: fLow['30d'] ?? 0,  d90: fLow['90d'] ?? 0,  d180: fLow['180d'] ?? 0,  d365: fLow['365d'] ?? 0 },
      forecastBaseM: { d30: fBase['30d'] ?? 0, d90: fBase['90d'] ?? 0, d180: fBase['180d'] ?? 0, d365: fBase['365d'] ?? 0 },
      forecastHighM: { d30: fHigh['30d'] ?? 0, d90: fHigh['90d'] ?? 0, d180: fHigh['180d'] ?? 0, d365: fHigh['365d'] ?? 0 },
      revenueScenarios: {
        '90d':  { low: pickRev('90d', 'low'),  base: pickRev('90d', 'base'),  high: pickRev('90d', 'high') },
        '180d': { low: pickRev('180d', 'low'), base: pickRev('180d', 'base'), high: pickRev('180d', 'high') },
        '365d': { low: pickRev('365d', 'low'), base: pickRev('365d', 'base'), high: pickRev('365d', 'high') },
      },
      riskFactors: {
        growthTrend: risk.growth_trend ?? 50,
        cadenceReliability: risk.cadence_reliability ?? 50,
        platformDiversification: risk.platform_diversification ?? 50,
        volatility: risk.low_volatility_higher_is_better ?? 50,
        concentrationRisk: risk.low_concentration_risk_higher_is_better ?? 50,
      },
      aiAssessmentNarrative: narrative,
      strengths: aiAssessment.strengths ?? [],
      watchFactors: aiAssessment.watch_factors ?? [],
      estimatedMonthlyIncome: aiAssessment.estimated_monthly_adsense_income ?? aiAssessment.estimated_monthly_ypp_income ?? '',
    };
  } catch {
    return null;
  }
}
