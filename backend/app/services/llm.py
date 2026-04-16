from __future__ import annotations

import json
import re

import anthropic
from openai import AsyncOpenAI

from app.core.config import settings

# Claude (primary)
_claude_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

# Groq (fallback)
_groq_client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1",
)

SYSTEM_PROMPT = """You are FanFolio's AI underwriter. You analyze YouTube creators as realistic investment opportunities.

You receive real YouTube API data (views, likes, comments, upload history, channel metadata). Every number is factual ground truth.

## Your job: produce accurate, globally-calibrated analysis that matches the real earnings a creator sees in YouTube Studio.

### Revenue model — ALL YouTube Partner Programme income streams:
YouTube pays creators through 5 mechanisms. Estimate each separately for this specific creator:

1. **Ad Revenue** (Watch Page Ads + Shorts Feed Ads)
   - Long-form: estimated_rpm_usd × views / 1000
   - RPM = (what the creator actually receives after YouTube's 45% cut). This varies enormously by country, niche, audience quality, and seasonality.
   - Use your knowledge of actual YouTube RPMs globally. Examples: US finance = $5–14 RPM, US tech = $3–8, English Indian tech (70% Indian audience) = $0.6–1.0, Hindi Indian = $0.25–0.55, Brazilian gaming = $0.8–2.0, UK beauty = $2–4. Apply the right one based on country AND audience language/demographics. Indian creators are systematically over-estimated — default to $0.6–0.9 for English Indian tech unless evidence proves otherwise.
   - Shorts RPM is ~$0.03–0.05 per 1000 views globally (much lower than long-form).

2. **YouTube Premium Revenue**
   - Additional ~15–25% on top of ad revenue in Tier-1 countries (US/UK/AU/DE/JP).
   - ~5–10% for India, SE Asia, LatAm where Premium penetration is low.
   - Estimate based on creator's primary audience country.

3. **Fan Funding** (Super Chat, Super Stickers, Super Thanks, Channel Memberships)
   - Only possible for creators who livestream or have strong community engagement.
   - Estimate from: engagement rate, comment activity, subscriber loyalty, whether titles/content suggest live streams.
   - Typical range: 0.1–2% of subscribers paying memberships (~$1–5/month each after YouTube's 30% cut).
   - Super Chat correlates with live stream frequency.

4. **YouTube Shopping Affiliate** — only estimate if niche is tech, beauty, fashion, or food. Skip for others.

5. **Creator Bonuses** — typically zero unless channel is in an active bonus program.

### Scoring (0-100) — always tier-relative:
Tiers: nano (<10K), micro (10K–100K), mid (100K–1M), large (1M–10M), mega (10M+)

- **growth**: Compare decay-corrected velocity (recent_avg_views_per_day) against tier norm. Accelerating = bullish.
- **engagement**: (likes+comments)/views ratio vs tier norm. Tier-adjusted: mega 0.5-1% healthy; mid 2-5% good; micro 5-8% good.
- **monetization**: Weighted blend of all revenue streams for this creator. A high-RPM US creator with 500K views/video scores higher than a low-RPM Indian creator with 5M views/video if total revenue is similar. Factor in fan funding potential.
- **consistency**: Upload cadence regularity from actual publish dates.
- **trend_alignment**: Google Trends data + your knowledge of topic momentum.
- **platform_risk**: Brand safety + channel size + content policy exposure.
- **volatility**: P90/P10 ratio (below 3x = tight = score 80+; above 10x = episodic = 30–50).
- **concentration_risk**: Topic/niche breadth.
- **platform_diversification**: Active cross-platform presence.
- **overall**: growth×0.25 + engagement×0.15 + monetization×0.20 + consistency×0.15 + trend×0.10 + risk×0.05 + diversification×0.05 + volatility×0.05

### Forecast:
- Use last5_avg_views as best per-video estimate.
- Multiply by (days / upload_cadence_days) for timeframe projections.
- Apply velocity trend: dampened by 40% to avoid over-projection.

### Use your own knowledge to enrich:
- Creator identity, content language, audience demographics
- Whether they livestream, their community engagement depth
- Their actual market RPM from your knowledge of YouTube economics globally

Always respond in valid JSON only — no markdown, no preamble."""


async def synthesize(creator_name: str, all_signals: dict) -> dict:
    """
    Try Claude first, then Groq, then rules-based fallback.
    """
    if settings.anthropic_api_key:
        try:
            result = await _claude_synthesize(creator_name, all_signals)
            if result and "error" not in result:
                return result
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Claude synthesis failed: {type(e).__name__}: {e}")

    if settings.groq_api_key:
        try:
            result = await _llm_synthesize(creator_name, all_signals)
            if result and "error" not in result:
                return result
        except Exception:
            pass

    return _rules_synthesize(creator_name, all_signals)


def _build_signal_summary(creator_name: str, all_signals: dict) -> str:
    """
    Compress all raw signals into a compact, LLM-friendly summary.
    Failed/missing sources are omitted entirely — Claude uses its own knowledge to fill gaps.
    Successful sources provide real-time ground truth that overrides Claude's priors.
    """
    youtube = all_signals.get("youtube", {})
    trends = all_signals.get("google_trends", {})
    news = all_signals.get("news", {})
    instagram = all_signals.get("instagram", {})
    social = all_signals.get("social", {})
    twitter = social.get("twitter", {})
    tiktok = social.get("tiktok", {})

    lines = [f"## Creator: {creator_name}\n"]

    # --- YouTube ---
    ch = youtube.get("channel", {})
    m = youtube.get("metrics", {})
    videos = youtube.get("recent_videos", [])
    long_form = [v for v in videos if not v.get("is_short")]
    shorts = [v for v in videos if v.get("is_short")]

    lines.append("### YouTube Channel")
    subs = ch.get('subscriber_count', 0)
    tier = m.get('channel_tier', 'unknown')
    lines.append(f"- Channel: {ch.get('name', creator_name)} | Handle: {ch.get('handle', '')}")
    lines.append(f"- Subscribers: {subs:,} | Tier: {tier} | Country: {ch.get('country', 'unknown')}")
    lines.append(f"- Total lifetime views: {ch.get('total_views', 0):,} | Total videos: {ch.get('video_count', 0):,}")
    lines.append(f"- Channel created: {(ch.get('published_at') or '')[:10]}")
    desc = (ch.get("description") or "")[:300]
    if desc:
        lines.append(f"- Description: {desc}")

    lines.append("\n#### Velocity & Performance (decay-corrected, comparable across video ages)")
    recent_vpd = m.get('recent_avg_views_per_day', 0)
    older_vpd = m.get('older_avg_views_per_day', 0)
    vel_trend = m.get('velocity_trend_pct', 0)
    last5 = m.get('last5_avg_views', 0)
    lines.append(f"- Recent velocity (last 10 vids, decay-adj views/day): {recent_vpd:,.1f}")
    lines.append(f"- Older velocity (vids 11-30, decay-adj views/day): {older_vpd:,.1f}")
    lines.append(f"- Velocity trend: {vel_trend:+.1f}% ({'ACCELERATING' if vel_trend > 5 else 'DECELERATING' if vel_trend < -5 else 'FLAT'})")
    lines.append(f"- Last 5 videos avg views (best next-video estimate): {last5:,}")
    lines.append(f"- P10/P35/P75 views per video (age-corrected 30d estimate, recent 20 videos only — P35=realistic base, P75=optimistic, P10=conservative): {m.get('p10_views',0):,} / {m.get('p50_views',0):,} / {m.get('p90_views',0):,}")
    lines.append(f"- Avg views (long-form, all 50): {m.get('avg_views',0):,}")
    lines.append(f"- Engagement rate (likes+comments/views): {m.get('engagement_rate_pct',0):.2f}%")
    lines.append(f"- Upload cadence: every {m.get('upload_cadence_days','?')} days | Long-form: {m.get('long_form_count',0)} | Shorts: {m.get('shorts_count',0)}")

    if long_form:
        lines.append(f"\n#### All Long-form Videos ({len(long_form)} total, newest first)")
        lines.append("Format: [date] title | views | likes | comments | days_live | decay-adj views/day")
        for v in long_form:
            v30 = v.get('velocity_30d_est', '?')
            days = v.get('days_live', '?')
            base = (
                f"  [{v.get('published_at','')[:10]}] \"{v.get('title','')}\" | "
                f"{v.get('view_count',0):,}v | {v.get('like_count',0):,}L | "
                f"{v.get('comment_count',0):,}C | {days}d live"
            )
            suffix = f" | ~{v30:,}v in 30d" if isinstance(v30, int) else ""
            lines.append(base + suffix)

    if shorts:
        lines.append(f"\n#### Shorts ({len(shorts)} total, newest first)")
        for v in shorts[:10]:
            lines.append(f"  [{v.get('published_at','')[:10]}] \"{v.get('title','')}\" | {v.get('view_count',0):,}v | {v.get('like_count',0):,}L")

    # --- Google Trends ---
    lines.append("\n### Google Trends")
    if trends.get("error"):
        lines.append(f"- Error: {trends['error']}")
    else:
        lines.append(f"- Current interest (0-100): {trends.get('current_interest', 'N/A')}")
        lines.append(f"- Trend direction: {trends.get('trend_direction', 'N/A')}")
        lines.append(f"- Peak interest (12mo): {trends.get('peak_interest', 'N/A')}")
        top_queries = trends.get("top_queries", [])
        if top_queries:
            lines.append(f"- Top search queries: {', '.join(str(q) for q in top_queries[:8])}")
        rising = trends.get("rising_queries", [])
        if rising:
            lines.append(f"- Rising queries: {', '.join(str(q) for q in rising[:5])}")

    # --- News ---
    lines.append("\n### News & Web Presence")
    if news.get("error"):
        lines.append(f"- Error: {news['error']}")
    else:
        articles = news.get("articles", [])
        lines.append(f"- Articles found: {len(articles)}")
        for a in articles[:8]:
            lines.append(f"  • [{a.get('source','?')}] \"{a.get('title','')}\" ({(a.get('published_at') or '')[:10]})")

    # --- Instagram ---
    lines.append("\n### Instagram")
    if instagram.get("error"):
        lines.append(f"- Error: {instagram['error']}")
    else:
        ig_m = instagram.get("metrics", {})
        lines.append(f"- Followers: {instagram.get('followers_count', 0):,}")
        lines.append(f"- Following: {instagram.get('follows_count', 0):,}")
        lines.append(f"- Total posts: {instagram.get('media_count', 0):,}")
        lines.append(f"- Avg likes: {ig_m.get('avg_likes', 0):,}")
        lines.append(f"- Avg comments: {ig_m.get('avg_comments', 0):,}")
        lines.append(f"- Engagement rate: {ig_m.get('engagement_rate_pct', 0):.2f}%")
        lines.append(f"- Content mix: {ig_m.get('reels_count',0)} reels, {ig_m.get('images_count',0)} images, {ig_m.get('carousels_count',0)} carousels")
        bio = (instagram.get("biography") or "")[:200]
        if bio:
            lines.append(f"- Bio: {bio}")

    # --- Twitter ---
    lines.append("\n### Twitter / X")
    if not twitter or twitter.get("error"):
        lines.append(f"- Error: {(twitter or {}).get('error', 'No data')}")
    else:
        tw_m = twitter.get("metrics", {})
        lines.append(f"- Handle: @{twitter.get('handle','?')}")
        lines.append(f"- Verified: {twitter.get('verified', False)}")
        lines.append(f"- Tweets analyzed: {twitter.get('tweets_fetched', 0)}")
        lines.append(f"- Avg likes: {tw_m.get('avg_likes', 0):,}")
        lines.append(f"- Avg retweets: {tw_m.get('avg_retweets', 0):,}")
        lines.append(f"- Avg replies: {tw_m.get('avg_replies', 0):,}")
        lines.append(f"- Avg impressions: {tw_m.get('avg_impressions', 0):,}")
        bio = (twitter.get("bio") or "")[:200]
        if bio:
            lines.append(f"- Bio: {bio}")
        recent_tweets = twitter.get("tweets", [])[:5]
        if recent_tweets:
            lines.append("- Recent tweets:")
            for t in recent_tweets:
                pm = t.get("public_metrics", {})
                lines.append(f"  • \"{t.get('text','')[:120]}\" — {pm.get('like_count',0)} likes, {pm.get('impression_count',0)} impressions")

    # --- TikTok ---
    lines.append("\n### TikTok")
    if not tiktok or tiktok.get("error"):
        lines.append(f"- Error: {(tiktok or {}).get('error', 'No data')}")
    else:
        tk_m = tiktok.get("metrics", {})
        lines.append(f"- Followers: {tk_m.get('followers', 'N/A')}")
        lines.append(f"- Total likes: {tk_m.get('total_likes', 'N/A')}")
        lines.append(f"- Video count: {tk_m.get('video_count', 'N/A')}")
        lines.append(f"- Verified: {tk_m.get('verified', False)}")
        lines.append(f"- Bio: {(tk_m.get('bio') or '')[:150]}")

    return "\n".join(lines)


def _build_json_prompt(signal_summary: str) -> str:
    return f"""{signal_summary}

---
Based on the above data and your own knowledge, return a JSON object with EXACTLY this structure (no extra keys):
{{
  "enriched": {{
    "niche_label": "Rich descriptive label e.g. AI • Tech • Entrepreneurship",
    "location": "Full city and country e.g. Bengaluru, Karnataka, India",
    "audience_demographics": "Primary audience e.g. 70% Indian viewers, 18-34, English+Hindi mix",
    "youtube_notes": "1-2 sentences on strategy and notable facts",
    "cadence_description": "Human-readable cadence e.g. 1-2 long-form/week + daily Shorts",
    "instagram": {{"username": "handle or null", "followers": "1.26M or null", "engagement_rate": "~0.6% or null"}},
    "twitter_x": {{"handle": "@handle or null", "followers": "246K or null", "bio": "bio or null"}},
    "linkedin": {{"url": "URL or null", "followers": "78K or null"}},
    "top_trending_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
    "trending_momentum": "High — [specific reason e.g. Kata series driving 150K-240K views consistently]"
  }},
  "life_events": [
    {{"event": "string", "detected_from": "string", "date_approx": "string", "impact": "positive|negative|neutral"}}
  ],
  "controversy_signals": [
    {{"description": "string", "source": "string", "rating": "bullish|bearish|neutral", "reasoning": "string"}}
  ],
  "scores": {{
    "growth": 0,
    "engagement": 0,
    "monetization": 0,
    "consistency": 0,
    "trend_alignment": 0,
    "platform_risk": 0,
    "platform_diversification": 0,
    "volatility": 0,
    "concentration_risk": 0,
    "overall": 0
  }},
  "forecast_adjustment": {{
    "p10_multiplier": 1.0,
    "p50_multiplier": 1.0,
    "p90_multiplier": 1.0,
    "effective_rpm_usd": 1.2,
    "rpm_reasoning": "e.g. Indian English tech creator, ~60% Indian + 40% global audience. Ad RPM ~$1.1 + Premium ~$0.1 + fan funding ~$0.05 effective per 1000 views = $1.2 blended",
    "reasoning": "string explaining view multiplier choices"
  }},
  "risk_flags": ["string"],
  "bullish_signals": ["string"],
  "signal_flags": {{"trend": ["string"], "social": ["string"]}},
  "narrative": "2-3 paragraph investment thesis: cover RPM context, all AdSense income streams, tier position, velocity trend, and realistic 12-month revenue outlook"
}}

## Scoring (0-100, ALWAYS tier-relative):
- growth: PRIMARY = decay-corrected velocity trend. recent_avg_views_per_day vs tier benchmark. Accelerating above benchmark = 80+. Below benchmark and decelerating = 30-50.
  Tier velocity norms: nano <200/day, micro 200-3K, mid 3K-30K, large 30K-200K, mega 200K+
- engagement: (likes+comments)/views vs tier norm. Mega: 0.5-1% = healthy (65+); mid: 2-5% = good (70+); micro: 5-8% = good (75+).
- monetization: Score based on TOTAL effective monthly AdSense income potential. A creator earning $3K/month scores higher than one earning $300/month at the same tier. Factor all streams.
- consistency: Regularity of actual publish dates — are gaps consistent or erratic?
- trend_alignment: Google Trends score + rising queries + your knowledge of topic momentum.
- platform_risk: Brand safety + channel size. Large brand-safe channel = 80+. Small or controversial = 40-60.
- volatility: P90/P10 ratio — below 3x = tight = 80+; above 10x = episodic spiker = 30-50.
- concentration_risk: Topic breadth. Single niche = 35-55; diversified = 70+.
- platform_diversification: Active platforms with real audiences. 4+ = 80+; YouTube-only = 35-45.
- overall: growth×0.25 + engagement×0.15 + monetization×0.20 + consistency×0.15 + trend×0.10 + risk×0.05 + diversification×0.05 + volatility×0.05

## effective_rpm_usd — this is the single most important number. Get it right:
This is the TOTAL AdSense income per 1000 long-form views, combining ALL streams YouTube pays through AdSense:
  effective_rpm = ad_rpm + premium_rpm_equiv + fan_funding_rpm_equiv + shopping_rpm_equiv

Step 1 — Ad RPM: Use your real knowledge of YouTube Studio RPMs (what creators actually see, after YouTube's 45% cut):
  - Hindi-language Indian creator (99% Indian audience): $0.25–0.55
  - English-language Indian creator (70% Indian + 30% global audience): $0.55–1.0
  - English-language Indian creator with confirmed strong US/EU pull (50/50 split): $1.0–1.6
  - US tech creator: $3–8; US finance: $5–14; US gaming: $1.5–3.5; US entertainment: $1–2.5
  - UK/AU creator: 70–80% of US equivalent; Germany/France: 55–70%; Japan/Korea: 45–60%
  - Brazil/Mexico: $0.8–2.0; Turkey/SE Asia: $0.4–1.2; Pakistan/Bangladesh: $0.15–0.45
  - Shorts: $0.03–0.05 RPM — almost negligible, don't let shorts volume inflate your RPM
  CRITICAL: Indian creators are chronically over-estimated. A Bengaluru-based English tech creator
  with 1M subs typically sees $0.65–0.90 RPM in YouTube Studio. Their audience is 65–75% Indian
  despite English language. Only go above $1.2 if you have clear evidence of majority US/EU viewership
  (e.g. channel primarily covers US-specific topics, community tab shows US-heavy comments).

Step 2 — YouTube Premium: adds ~15–25% on top of ad RPM for US/UK/AU/DE/JP audiences; ~5–10% for India/LatAm/SE Asia.

Step 3 — Fan Funding (Super Chat + Super Thanks + Memberships): Convert to per-1000-views equivalent.
  Estimate from: engagement rate, comment depth, whether they livestream (check titles for "live", "stream", "premiere").
  Rule of thumb: engaged mid-tier channel earns $100–500/month from fan funding.
  Divide by monthly views/1000 to get RPM equivalent.

Step 4 — Shopping Affiliate: Only for tech (gear), beauty, fashion, food. Small addition ($0.05–0.3 RPM equiv).

Step 5 — Sum all: that's your effective_rpm_usd. Show your working in rpm_reasoning.

## forecast_adjustment multipliers:
IMPORTANT: Python code already applies `velocity_trend_pct × 0.4` as a trend adjustment. Your multipliers correct for additional signal BEYOND the trend (e.g., confirmed viral series, niche collapse, known controversy). Do NOT double-count trend.

  - velocity_trend_pct > +30% AND strong external signal: p50×1.2–1.4
  - +10% to +30%: p50×1.05–1.15
  - -10% to +10%: all ×1.0 (flat — default for most channels)
  - -10% to -30%: p10×0.8, p50×0.9
  - < -30%: p10×0.6, p50×0.75 (declining fast)
  Clamp: p50_multiplier must stay in [0.7, 1.4]. p90_multiplier max 2.0. p10_multiplier min 0.5.

## CRITICAL: Revenue sanity check (do this BEFORE finalising effective_rpm_usd):
1. Monthly views estimate = (p50_views × 30) / upload_cadence_days  (this is the per-month view rate from typical single-video performance)
2. Monthly AdSense income = monthly_views / 1000 × effective_rpm_usd
3. Cross-check against subscriber tier reality:
   - nano (<10K subs): $0–$200/month
   - micro (10K–100K subs): $50–$1,500/month
   - mid (100K–1M subs): $500–$15,000/month
   - large (1M–10M subs): $3,000–$80,000/month
   - mega (10M+ subs): $20,000–$500,000/month
4. If your estimate is >2× the upper bound for that tier, REDUCE effective_rpm_usd or use more conservative multipliers.
5. Show your sanity check in rpm_reasoning: "p50=Xviews, cadence=Yd, rpm=$Z → ~$Wk/month. Tier check: [mid], upper bound $15K/mo → PASS/ADJUSTED"

For narrative: reference the effective_rpm reasoning, specific revenue stream estimates, velocity tier context, and realistic 12-month total income projection.
For risk_flags and bullish_signals: cite actual numbers from the data."""


def _normalize_scores(result: dict) -> dict:
    if "scores" in result:
        for k, v in result["scores"].items():
            if isinstance(v, float) and v <= 1.0:
                result["scores"][k] = round(v * 100)
            else:
                result["scores"][k] = int(v)
    return result


async def _claude_synthesize(creator_name: str, all_signals: dict) -> dict:
    signal_summary = _build_signal_summary(creator_name, all_signals)
    prompt = _build_json_prompt(signal_summary)

    response = await _claude_client.messages.create(
        model=settings.claude_model,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    raw = response.content[0].text

    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw.strip())

    result = json.loads(raw)
    result = _normalize_scores(result)
    result["synthesis_method"] = "claude"
    return result


async def _llm_synthesize(creator_name: str, all_signals: dict) -> dict:
    signal_summary = _build_signal_summary(creator_name, all_signals)
    prompt = _build_json_prompt(signal_summary)

    response = await _groq_client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
    )
    raw = response.choices[0].message.content

    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw.strip())

    result = json.loads(raw)
    result = _normalize_scores(result)
    result["synthesis_method"] = "groq"
    return result


def _rules_synthesize(creator_name: str, all_signals: dict) -> dict:
    """
    Fully rules-based fallback — computes all scores from raw signal data.
    No LLM required. Always works.
    """
    youtube = all_signals.get("youtube", {})
    trends = all_signals.get("google_trends", {})
    news = all_signals.get("news", {})
    instagram = all_signals.get("instagram", {})
    social = all_signals.get("social", {})

    metrics = youtube.get("metrics", {})
    channel = youtube.get("channel", {})
    tier = metrics.get("channel_tier", "micro")

    # Tier benchmark: typical views/day for this tier
    tier_vpd_benchmark = {
        "nano": 200, "micro": 1500, "mid": 10000,
        "large": 80000, "mega": 300000,
    }.get(tier, 1500)

    # --- Growth score (0-100) — VidIQ velocity-based ---
    recent_vpd = metrics.get("recent_avg_views_per_day", 0) or 0
    vel_trend = metrics.get("velocity_trend_pct", 0) or 0
    vpd_ratio = recent_vpd / max(1, tier_vpd_benchmark)  # >1 = above benchmark

    if vpd_ratio >= 2.0 and vel_trend > 10:
        growth_score = 92
    elif vpd_ratio >= 1.5 or vel_trend > 20:
        growth_score = 82
    elif vpd_ratio >= 1.0 and vel_trend > 0:
        growth_score = 70
    elif vpd_ratio >= 0.5 and vel_trend > -10:
        growth_score = 55
    elif vel_trend < -20:
        growth_score = 25
    else:
        growth_score = 40

    # --- Engagement score (0-100) ---
    er = metrics.get("engagement_rate_pct", 0) or 0
    if er > 10:
        engagement_score = 95
    elif er > 5:
        engagement_score = 80
    elif er > 2:
        engagement_score = 65
    elif er > 1:
        engagement_score = 50
    else:
        engagement_score = 30

    # --- Consistency score (0-100) ---
    cadence = metrics.get("upload_cadence_days", 7) or 7
    if cadence <= 3:
        consistency_score = 95
    elif cadence <= 7:
        consistency_score = 80
    elif cadence <= 14:
        consistency_score = 60
    elif cadence <= 30:
        consistency_score = 40
    else:
        consistency_score = 20

    # --- Trend alignment score (0-100) ---
    trend_score = 50
    trend_value = trends.get("current_interest", 0) or 0
    if trend_value > 75:
        trend_score = 90
    elif trend_value > 50:
        trend_score = 70
    elif trend_value > 25:
        trend_score = 55
    elif trend_value == 0:
        trend_score = 40

    # --- AdSense monetization score (0-100) ---
    # Based purely on AdSense signals: niche CPM tier, long-form ratio, advertiser safety
    description = (channel.get("description") or "").lower()
    keywords = (channel.get("keywords") or "").lower()
    combined = description + " " + keywords

    # Niche CPM tier → base score
    niche = _detect_niche(combined)
    niche_base = {
        "finance": 90, "business": 80, "tech": 75, "education": 65,
        "health": 60, "beauty": 55, "food": 50, "travel": 50,
        "gaming": 45, "entertainment": 40, "general": 40,
    }.get(niche, 40)
    monetization_score = niche_base

    # Long-form content ratio bonus (long-form has much higher RPM than Shorts)
    lf_count = len([v for v in youtube.get("recent_videos", []) if not v.get("is_short")])
    total_count = max(1, len(youtube.get("recent_videos", [])))
    lf_ratio = lf_count / total_count
    if lf_ratio >= 0.5:
        monetization_score = min(95, monetization_score + 10)

    # Demonetization risk penalty
    demonetization_keywords = ["political", "controversy", "war", "gun", "drug", "violence", "nsfw", "adult"]
    if any(w in combined for w in demonetization_keywords):
        monetization_score = max(10, monetization_score - 15)

    ig_metrics = instagram.get("metrics", {})
    ig_er = ig_metrics.get("engagement_rate_pct", 0) or 0

    # --- Platform risk score (0-100, lower = more risky) ---
    platform_risk = 70  # default moderate-safe
    subs = channel.get("subscriber_count", 0) or 0
    if subs > 10_000_000:
        platform_risk = 85  # large channels rarely demonetized
    elif subs < 100_000:
        platform_risk = 50

    # --- Platform diversification (0-100): active platform count ---
    active_platforms = 1  # YouTube always present
    if not instagram.get("error"):
        active_platforms += 1
    if social.get("twitter") and not social["twitter"].get("error"):
        active_platforms += 1
    if social.get("tiktok") and not social["tiktok"].get("error"):
        active_platforms += 1
    if social.get("linkedin") and not social["linkedin"].get("error"):
        active_platforms += 1
    platform_diversification = {1: 40, 2: 55, 3: 70, 4: 80, 5: 90}.get(active_platforms, 40)

    # --- Volatility (0-100, higher = less volatile = better) ---
    p10 = metrics.get("p10_views", 0) or 0
    p50 = metrics.get("p50_views", 1) or 1
    p90 = metrics.get("p90_views", 0) or 0
    spread_ratio = (p90 - p10) / p50 if p50 > 0 else 3.0
    if spread_ratio < 0.5:
        volatility_score = 90
    elif spread_ratio < 1.0:
        volatility_score = 75
    elif spread_ratio < 2.0:
        volatility_score = 60
    elif spread_ratio < 3.0:
        volatility_score = 45
    else:
        volatility_score = 30

    # --- Concentration risk (0-100, higher = lower concentration = better) ---
    if monetization_score >= 70 and platform_diversification >= 70:
        concentration_risk = 85
    elif monetization_score >= 50 or platform_diversification >= 70:
        concentration_risk = 65
    else:
        concentration_risk = 45

    # --- Overall (weighted average) ---
    overall = round(
        growth_score * 0.25
        + engagement_score * 0.20
        + consistency_score * 0.15
        + monetization_score * 0.20
        + trend_score * 0.10
        + platform_risk * 0.10
    )

    # --- Life events: scan recent video titles ---
    life_events = []
    life_keywords = {
        "marriage": ["married", "wedding", "engaged", "engagement", "proposal"],
        "baby": ["baby", "pregnant", "pregnancy", "expecting", "newborn"],
        "health": ["surgery", "hospital", "sick", "cancer", "recovery", "health"],
        "burnout": ["break", "burnout", "quit", "leaving", "mental health"],
        "milestone": ["million", "subscribers", "anniversary", "years"],
    }
    for video in youtube.get("recent_videos", []):
        title = (video.get("title") or "").lower()
        for event_type, kws in life_keywords.items():
            if any(kw in title for kw in kws):
                life_events.append({
                    "event": event_type,
                    "detected_from": video.get("title"),
                    "date_approx": video.get("published_at", "")[:10],
                    "impact": "positive" if event_type in ("marriage", "baby", "milestone") else "neutral",
                })

    # --- Controversy: scan news ---
    controversy_signals = []
    controversy_kws = ["controversy", "drama", "scandal", "banned", "cancelled",
                       "lawsuit", "allegations", "backlash", "beef", "feud"]
    for article in news.get("articles", []):
        headline = (article.get("title") or "").lower()
        if any(kw in headline for kw in controversy_kws):
            controversy_signals.append({
                "description": article.get("title"),
                "source": article.get("source"),
                "rating": "neutral",
                "reasoning": "Detected via news headline — manual review recommended",
            })

    # --- Bullish/risk flags ---
    bullish = []
    risk_flags = []

    if vel_trend > 10:
        bullish.append(f"Accelerating view velocity: +{vel_trend:.1f}% trend vs older videos")
    if vpd_ratio >= 1.5:
        bullish.append(f"Above-tier velocity: {recent_vpd:,.0f} views/day vs {tier_vpd_benchmark:,} benchmark")
    if er > 5:
        bullish.append(f"High engagement rate: {er:.1f}%")
    if active_platforms >= 3:
        bullish.append("Strong monetization diversification detected")
    if trend_value > 60:
        bullish.append(f"Currently trending on Google (score: {trend_value})")
    if ig_er > 3:
        bullish.append(f"Strong Instagram engagement: {ig_er:.1f}%")

    if cadence > 21:
        risk_flags.append(f"Slow upload cadence: every {cadence:.0f} days")
    if vel_trend < -10:
        risk_flags.append(f"Declining view velocity: {vel_trend:.1f}% trend")
    if vpd_ratio < 0.3:
        risk_flags.append(f"Below-tier velocity: {recent_vpd:,.0f} views/day vs {tier_vpd_benchmark:,} benchmark")
    if controversy_signals:
        risk_flags.append(f"{len(controversy_signals)} controversy mention(s) in news")

    # --- Trend & social signal flags ---
    trend_flags = []
    social_flags = []

    trend_direction = trends.get("trend_direction", "")
    if trend_direction == "rising":
        trend_flags.append("Topics trending up")
    elif trend_direction == "stable":
        trend_flags.append("Stable search interest")
    if trends.get("top_queries"):
        trend_flags.append("Strong SEO footprint")
    if vel_trend >= 0:
        trend_flags.append("Consistent or accelerating velocity")
    if not controversy_signals:
        social_flags.append("No controversy flags")
    if active_platforms >= 3:
        social_flags.append("Cross-platform momentum")
    if ig_er > 3:
        social_flags.append(f"Strong Instagram engagement: {ig_er:.1f}%")

    # --- Narrative ---
    avg_views = metrics.get("avg_views", 0) or 0
    subs_fmt = f"{subs / 1_000_000:.1f}M" if subs >= 1_000_000 else f"{subs:,}"
    narrative = (
        f"{creator_name} is a {tier}-tier content creator with {subs_fmt} subscribers. "
        f"Recent view velocity: {recent_vpd:,.0f} views/day (tier benchmark: {tier_vpd_benchmark:,}/day), "
        f"velocity trend: {vel_trend:+.1f}%. "
        f"Average {avg_views:,.0f} views per video; engagement rate {er:.1f}%; uploads every {cadence:.0f} days. "
        f"Growth momentum is {'strong' if growth_score >= 70 else 'moderate' if growth_score >= 50 else 'weak'}. "
        f"AdSense niche: {niche} (CPM tier), long-form ratio: {lf_ratio:.0%}. "
        f"Overall investability score: {overall}/100."
    )

    return {
        "life_events": life_events,
        "controversy_signals": controversy_signals,
        "scores": {
            "growth": growth_score,
            "engagement": engagement_score,
            "monetization": monetization_score,
            "consistency": consistency_score,
            "trend_alignment": trend_score,
            "platform_risk": platform_risk,
            "platform_diversification": platform_diversification,
            "volatility": volatility_score,
            "concentration_risk": concentration_risk,
            "overall": overall,
        },
        "forecast_adjustment": {
            "p10_multiplier": 1.0,
            "p50_multiplier": 1.0,
            "p90_multiplier": 1.0,
            "reasoning": "Rules-based — no LLM adjustment applied",
        },
        "risk_flags": risk_flags,
        "bullish_signals": bullish,
        "signal_flags": {"trend": trend_flags, "social": social_flags},
        "narrative": narrative,
        "synthesis_method": "rules_based",
    }


SHORTS_CPM = 0.04  # YouTube Shorts RPM ~$0.03–0.05 per 1000 views globally


def compute_revenue_proxy(youtube_data: dict, llm_result: dict | None = None) -> dict:
    """
    Build revenue proxy using effective_rpm_usd from Claude (covers all YPP streams).
    Falls back to conservative Python estimate if Claude data unavailable.
    """
    channel = youtube_data.get("channel", {})
    metrics = youtube_data.get("metrics", {})
    videos = youtube_data.get("recent_videos", [])

    keywords = (channel.get("keywords") or "").lower()
    description = (channel.get("description") or "").lower()
    niche = _detect_niche(keywords + " " + description)

    # Upload split
    long_form = [v for v in videos if not v.get("is_short")]
    shorts = [v for v in videos if v.get("is_short")]
    total_observed = max(1, len(long_form) + len(shorts))
    total_cadence = metrics.get("upload_cadence_days") or 7
    total_per_month = max(1, round(30 / total_cadence))
    lf_per_month = max(1, round(total_per_month * len(long_form) / total_observed))
    sh_per_month = max(0, round(total_per_month * len(shorts) / total_observed))

    last5_avg = metrics.get("last5_avg_views", 0) or 0
    lf_avg = last5_avg if last5_avg > 0 else (metrics.get("avg_views", 0) or 0)
    lf_p10 = metrics.get("p10_views", 0) or 0
    lf_p50 = metrics.get("p50_views", 0) or 0
    lf_p90 = metrics.get("p90_views", 0) or 0

    sh_views = sorted([v["view_count"] for v in shorts]) if shorts else []
    sh_p50 = sh_views[max(0, int(len(sh_views) * 0.50) - 1)] if sh_views else 0

    # --- effective_rpm_usd from Claude covers ALL YPP streams ---
    adj = (llm_result or {}).get("forecast_adjustment", {})
    effective_rpm = adj.get("effective_rpm_usd")
    rpm_reasoning = adj.get("rpm_reasoning", "")

    if not effective_rpm or effective_rpm <= 0:
        # Fallback: conservative estimate without Claude
        base_by_niche = {
            "finance": 8.0, "business": 6.0, "tech": 5.0, "education": 4.0,
            "health": 3.5, "beauty": 3.0, "food": 2.5, "entertainment": 2.0,
            "gaming": 2.0, "travel": 2.5, "general": 1.5,
        }
        country = (channel.get("country") or "").upper()
        country_factor = {"US": 1.0, "GB": 0.85, "AU": 0.80, "CA": 0.80, "DE": 0.70}.get(country, 0.3)
        effective_rpm = round(base_by_niche.get(niche, 1.5) * country_factor, 2)
        rpm_reasoning = f"Fallback estimate: {niche} niche × {country} country factor ({country_factor})"

    def rev(views: int) -> float:
        return round((views / 1000) * effective_rpm * lf_per_month, 2)

    def sh_rev(views: int) -> float:
        return round((views / 1000) * SHORTS_CPM * sh_per_month, 2)

    return {
        "revenue_source": "adsense",
        "niche_detected": niche,
        "effective_rpm_usd": effective_rpm,
        "rpm_reasoning": rpm_reasoning,
        "long_form": {
            "adsense_cpm_usd": effective_rpm,  # kept for formatter compat
            "videos_per_month_est": lf_per_month,
            "avg_views": lf_avg,
            "monthly_adsense_p10_usd": rev(lf_p10),
            "monthly_adsense_p50_usd": rev(lf_p50),
            "monthly_adsense_p90_usd": rev(lf_p90),
            "monthly_adsense_avg_usd": rev(lf_avg),
        },
        "shorts": {
            "adsense_cpm_usd": SHORTS_CPM,
            "videos_per_month_est": sh_per_month,
            "monthly_adsense_p50_usd": sh_rev(sh_p50),
        },
        "combined_monthly_adsense": {
            "p10_usd": round(rev(lf_p10) + sh_rev(sh_p50) * 0.7, 2),
            "p50_usd": round(rev(lf_p50) + sh_rev(sh_p50), 2),
            "p90_usd": round(rev(lf_p90) + sh_rev(sh_p50) * 1.3, 2),
            "avg_usd": round(rev(lf_avg) + sh_rev(sh_p50), 2),
        },
    }


def _detect_niche(text: str) -> str:
    # Entertainment/challenge checked first — broad creators like MrBeast hit "software" etc.
    if any(w in text for w in ["challenge", "stunt", "viral", "squid game", "beast games", "feastables"]):
        return "entertainment"
    if any(w in text for w in ["finance", "investing", "stock", "crypto"]):
        return "finance"
    if any(w in text for w in ["gaming", "game", "esports"]):
        return "gaming"
    if any(w in text for w in ["education", "tutorial", "learn", "course", "study"]):
        return "education"
    if any(w in text for w in ["health", "fitness", "wellness", "medical"]):
        return "health"
    if any(w in text for w in ["business", "entrepreneur", "startup", "marketing"]):
        return "business"
    if any(w in text for w in ["tech", "software", "coding", "programming", "saas"]):
        return "tech"
    if any(w in text for w in ["beauty", "makeup", "fashion", "style"]):
        return "beauty"
    if any(w in text for w in ["food", "cooking", "recipe"]):
        return "food"
    if any(w in text for w in ["travel", "vlog"]):
        return "travel"
    return "general"
