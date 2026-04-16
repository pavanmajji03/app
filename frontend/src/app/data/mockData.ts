// Type definitions derived from the data structure in /public/assets/data/creators.json
// All actual data has been moved to static JSON files served via GET requests.

export interface Creator {
  id: string;
  name: string;
  handle: string;
  category: string;
  image: string;
  subscribers: string;
  subscribersNum: number;
  avgViews: string;
  totalViews: string;
  growthRate: string;
  engagementRate: string;
  uploadFreq: string;
  aiScore: number;
  riskLevel: string;
  targetAmount: number;
  raisedAmount: number;
  investorCount: number;
  term: number;
  revenueShare: number;
  returnLow: number;
  returnBase: number;
  returnHigh: number;
  tags: string[];
  description: string;
  platforms: string[];
  location: string;
  forecastData: {
    views30: { low: number; base: number; high: number };
    views90: { low: number; base: number; high: number };
    views180: { low: number; base: number; high: number };
  };
  recentVideos: { title: string; views: string; daysAgo: number; thumbnail?: string }[];
  riskFactors: {
    volatility: number;
    growthTrend: number;
    concentrationRisk: number;
    cadenceReliability: number;
    platformDiversification: number;
  };
}

export interface PortfolioInvestment {
  id: string;
  creatorId: string;
  creatorName: string;
  category: string;
  invested: number;
  currentValue: number;
  earned: number;
  term: number;
  monthsIn: number;
  returnBase: number;
  status: string;
  nextPayout: string;
  image: string;
  monthlyData: { month: string; earned: number; projected: number }[];
}

export interface PortfolioChartPoint {
  month: string;
  portfolio: number;
  earned: number;
}

export interface StatementData {
  month: string;
  investorName: string;
  creatorName: string;
  creatorHandle: string;
  investedAmount: number;
  revenueShare: number;
  term: number;
  actualViews: number;
  estimatedViews: { low: number; base: number; high: number };
  estimatedRPM: number;
  estimatedRevenue: number;
  yourShareRate: number;
  yourPayout: number;
  cumulativeEarned: number;
  projectedTotal: { low: number; base: number; high: number };
  performanceNotes: string;
}

export interface InvestorActivity {
  name: string;
  amount: number;
  days: number;
}

export interface TermOption {
  months: number;
  label: string;
  desc: string;
  popular: boolean;
}

export interface AnalysisStep {
  id: number;
  icon: string;
  label: string;
  detail: string;
  duration: number;
}

export interface SignalSummary {
  label: string;
  value: string;
}

export interface OnboardingConfig {
  steps: string[];
  defaultForm: {
    youtubeUrl: string;
    instagram: string;
    tiktok: string;
    twitter: string;
    linkedin: string;
    videoTitle: string;
    videoDesc: string;
    videoDate: string;
    videoFormat: string;
  };
  analysisChecklist: string[];
}

export interface AnalysisChannel {
  ai_underwriting_report: {
    channel_name: string;
    handle: string;
    niche: string;
    location: string;
    subscribers: string;
    avg_views: string;
    growth_rate: string;
    ai_score: number;
    ai_score_label: string;
    total_views: string;
    total_videos: string;
    recent_performance: string;
  };
  youtube_signals: {
    subscribers: string;
    total_views: string;
    recent_videos: string;
    growth_rate: string;
    cadence: string;
    notes: string;
  };
  social_signals: {
    instagram: { username: string; followers: string; engagement_rate: string };
    twitter_x: { handle: string; followers: string; bio: string };
    linkedin: { url: string; followers: string };
    cross_platform_momentum: string;
    no_controversy_flags: boolean;
  };
  trending_topics_analysis: {
    analyzed: boolean;
    top_trending_topics: string[];
    momentum: string;
  };
  view_forecast_millions_180_days: {
    low_conservative: { '30d': number; '90d': number; '180d': number; notes: string };
    base_expected:    { '30d': number; '90d': number; '180d': number; notes: string };
    high_optimistic:  { '30d': number; '90d': number; '180d': number; notes: string };
  };
  revenue_scenarios_180_days_youtube_only: {
    low_conservative: { views: string; estimated_adSense: string; notes: string };
    base_expected:    { views: string; estimated_adSense: string; notes: string };
    high_optimistic:  { views: string; estimated_adSense: string; notes: string };
  };
  campaign_readiness: {
    overall_score: string;
    qualifies_for_campaign: boolean;
    message: string;
  };
  risk_factor_analysis: {
    growth_trend: number;
    cadence_reliability: number;
    platform_diversification: number;
    low_volatility_higher_is_better: number;
    low_concentration_risk_higher_is_better: number;
  };
  ai_assessment_summary: {
    strengths: string[];
    watch_factors: string[];
    youtube_only_adSense_monthly: string;
    confidence_score: number;
    confidence_based_on: string;
  };
}

export interface ReportSignals {
  signalGroups: {
    icon: string;
    label: string;
    items: string[];
  }[];
  revenueScenarios: {
    key: string;
    label: string;
    description: string;
    views: string;
    revenue: string;
    fanReturn: string;
    color: string;
  }[];
  assessment: {
    strengths: string[];
    watchFactors: string[];
    confidenceScore: string;
  };
}

