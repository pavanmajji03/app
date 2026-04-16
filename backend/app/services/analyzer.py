from __future__ import annotations

import asyncio
import uuid

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.analysis import AnalysisStatus, CreatorAnalysis
from app.models.creator import Creator
from app.models.genre import Genre
from app.services import llm
from app.services.collectors import apify, google_trends, instagram, news, youtube


async def run_analysis(
    analysis_id: str,
    creator_id: str,
    channel_input: str,
    instagram_username: str | None,
    twitter_handle: str | None,
    tiktok_handle: str | None,
    linkedin_url: str | None,
) -> None:
    """
    Full analysis pipeline — runs all collectors in parallel, synthesizes with LLM,
    and persists results. Runs as a background task with its own DB session.
    """
    async with AsyncSessionLocal() as db:
        analysis = await db.get(CreatorAnalysis, uuid.UUID(analysis_id))
        if not analysis:
            return

        try:
            analysis.status = AnalysisStatus.PROCESSING
            await db.commit()

            # --- Step 1: YouTube first to resolve creator name ---
            youtube_data = await _safe(youtube.collect, channel_input)
            creator_name = (
                youtube_data.get("channel", {}).get("name") or channel_input
            )

            # Update creator record with resolved info
            creator = await db.get(Creator, uuid.UUID(creator_id))
            if creator:
                channel = youtube_data.get("channel", {})
                creator.name = channel.get("name") or creator.name
                creator.handle = channel.get("handle") or creator.handle
                creator.thumbnail_url = channel.get("thumbnail_url") or creator.thumbnail_url
                await db.commit()

            # --- Step 2: Run remaining collectors in parallel ---
            (
                trends_data,
                news_data,
                instagram_data,
                social_data,
            ) = await asyncio.gather(
                _safe(google_trends.collect, creator_name),
                _safe(news.collect, creator_name),
                _safe(instagram.collect, instagram_username),
                _safe(
                    apify.collect,
                    creator_name,
                    twitter_handle=twitter_handle,
                    tiktok_handle=tiktok_handle,
                    linkedin_url=linkedin_url,
                ),
            )

            # --- Step 3: LLM synthesis ---
            all_signals = {
                "youtube": youtube_data,
                "google_trends": trends_data,
                "news": news_data,
                "instagram": instagram_data,
                "social": social_data,
            }

            llm_result = await _safe(llm.synthesize, creator_name, all_signals)

            # --- Step 4: Revenue proxy (pass llm_result so Claude's RPM estimates are used) ---
            revenue_proxy = llm.compute_revenue_proxy(youtube_data, llm_result)

            # --- Step 5: Final P10/P50/P90 forecast with LLM adjustments + timeframes ---
            forecast = _build_forecast(youtube_data, llm_result)

            # --- Step 6: 180-day revenue scenarios ---
            revenue_proxy["scenarios_180d"] = _build_revenue_scenarios_180d(revenue_proxy, forecast)

            # --- Step 7: Confidence score ---
            scores = llm_result.get("scores", {})
            confidence = _compute_confidence(youtube_data, instagram_data, trends_data, news_data, social_data)
            scores["confidence_score"] = confidence["confidence_score"]
            scores["data_points_count"] = confidence["data_points_count"]
            scores["synthesis_method"] = llm_result.get("synthesis_method", "unknown")
            scores["enriched"] = llm_result.get("enriched", {})

            # --- Step 8: Persist ---
            analysis.youtube_data = youtube_data
            analysis.instagram_data = instagram_data
            analysis.trends_data = trends_data
            analysis.news_data = news_data
            analysis.social_data = social_data
            analysis.life_events = {"events": llm_result.get("life_events", [])}
            analysis.controversy_signals = {"signals": llm_result.get("controversy_signals", [])}
            analysis.scores = scores
            analysis.forecast = forecast
            analysis.revenue_proxy = revenue_proxy
            analysis.narrative = llm_result.get("narrative")
            analysis.status = AnalysisStatus.COMPLETED

            # --- Step 9: Enrich Creator record for marketplace ---
            creator = await db.get(Creator, uuid.UUID(creator_id))
            if creator:
                ai_score = scores.get("overall", 0)
                niche_raw = revenue_proxy.get("niche_detected", "general")
                yt_metrics = youtube_data.get("metrics", {})
                yt_channel = youtube_data.get("channel", {})
                growth_pct = yt_metrics.get("velocity_trend_pct", 0) or yt_metrics.get("growth_signal_pct", 0) or 0
                # Use LLM-detected genres if available, else fall back to niche map
                llm_genres = (
                    llm_result.get("enriched", {}).get("niche_label", "")
                    if llm_result and not llm_result.get("error")
                    else ""
                )
                genres = _genres_from_llm(llm_genres) or _genres_for_niche(niche_raw)
                creator.genres = genres
                creator.niche = niche_raw
                creator.ai_score = ai_score
                creator.risk_level = _risk_level(ai_score)
                creator.subscribers_str = _fmt_num(yt_channel.get("subscriber_count", 0))
                creator.avg_views_str = f"~{_fmt_num(yt_metrics.get('avg_views', 0))}"
                creator.growth_rate_str = f"+{growth_pct:.0f}%" if growth_pct >= 0 else f"{growth_pct:.0f}%"

                # Upsert any new genres into the Genre table
                for genre_name in genres:
                    exists = await db.execute(select(Genre).where(Genre.name == genre_name))
                    if not exists.scalar_one_or_none():
                        db.add(Genre(name=genre_name))

            await db.commit()

        except Exception as e:
            analysis.status = AnalysisStatus.FAILED
            analysis.error = str(e)
            await db.commit()
            raise


async def _safe(fn, *args, **kwargs):
    """Run a collector and return error dict instead of raising."""
    try:
        return await fn(*args, **kwargs)
    except Exception as e:
        return {"error": str(e)}


# ── Creator enrichment helpers ─────────────────────────────────────────────────

_NICHE_GENRES: dict[str, list[str]] = {
    "finance":       ["Finance", "Investing", "Business"],
    "business":      ["Business", "Entrepreneurship"],
    "tech":          ["Tech", "AI", "Software"],
    "education":     ["Education", "Tutorials", "Learning"],
    "health":        ["Health", "Fitness", "Wellness"],
    "beauty":        ["Beauty", "Fashion", "Lifestyle"],
    "food":          ["Food", "Cooking", "Recipes"],
    "travel":        ["Travel", "Vlogging", "Lifestyle"],
    "gaming":        ["Gaming", "Esports"],
    "entertainment": ["Entertainment", "Comedy"],
    "sports":        ["Sports"],
    "music":         ["Music"],
    "science":       ["Science", "Education"],
    "news":          ["News", "Politics"],
    "general":       ["Lifestyle"],
}


def _genres_from_llm(niche_label: str) -> list[str]:
    """
    Parse genres directly from the LLM's niche_label (e.g. 'AI • Tech • Entrepreneurship').
    Returns a list of matched genre names from the known genre set.
    Falls back to empty list if nothing matches (caller uses _genres_for_niche as fallback).
    """
    known_genres = {
        "AI", "Beauty", "Business", "Comedy", "Cooking", "Education",
        "Entertainment", "Entrepreneurship", "Esports", "Fashion", "Finance",
        "Fitness", "Food", "Gaming", "Health", "Investing", "Learning",
        "Lifestyle", "Music", "News", "Politics", "Recipes", "Science",
        "Software", "Sports", "Tech", "Travel", "Tutorials", "Vlogging", "Wellness",
    }
    label_lower = niche_label.lower()
    matched = [g for g in known_genres if g.lower() in label_lower]
    return matched[:5] if matched else []


def _genres_for_niche(niche: str) -> list[str]:
    niche = (niche or "general").lower()
    for key, genres in _NICHE_GENRES.items():
        if key in niche:
            return genres
    return _NICHE_GENRES["general"]


def _risk_level(ai_score: int) -> str:
    if ai_score >= 80:
        return "Low"
    if ai_score >= 70:
        return "Low-Med"
    if ai_score >= 60:
        return "Medium"
    return "High"


def _fmt_num(n: int | float | None) -> str:
    if not n:
        return "0"
    if n >= 1_000_000_000:
        return f"{n / 1_000_000_000:.1f}B"
    if n >= 1_000_000:
        return f"{n / 1_000_000:.2f}M".rstrip("0").rstrip(".")
    if n >= 1_000:
        return f"{n / 1_000:.1f}K".rstrip("0").rstrip(".")
    return str(round(n))


def _build_forecast(youtube_data: dict, llm_result: dict) -> dict:
    """
    Accurate per-video × cadence forecast using last5_avg as best current estimate.

    Base: last5_avg_views (most recent 5 videos — best next-video signal)
    Spread: historical P10/P90 ratios relative to P50
    Trend: velocity_trend_pct dampened by 40% to avoid over-projection
    LLM: forecast_adjustment multipliers from Claude's analysis
    """
    metrics = youtube_data.get("metrics", {})
    adjustment = llm_result.get("forecast_adjustment", {})

    cadence = metrics.get("upload_cadence_days", 7) or 7
    vel_trend_pct = metrics.get("velocity_trend_pct", 0) or 0
    recent_vpd = metrics.get("recent_avg_views_per_day", 0) or 0
    older_vpd = metrics.get("older_avg_views_per_day", 0) or 0

    # Per-video view baselines
    p10_per_vid = metrics.get("p10_views", 0)
    p50_per_vid = metrics.get("p50_views", 0)
    p90_per_vid = metrics.get("p90_views", 0)
    last5_avg = metrics.get("last5_avg_views", 0) or 0

    # Best next-video estimate: last5_avg (now age-corrected via velocity_30d_est),
    # but cap at 2× p50 so a single viral outlier can't blow up the forecast.
    if last5_avg > 0:
        best_base = min(last5_avg, round(p50_per_vid * 2.0)) if p50_per_vid > 0 else last5_avg
    else:
        best_base = p50_per_vid

    # LLM forecast multipliers — Claude returns values; clamp to sane range
    # (Python already applies velocity trend; multipliers correct for additional LLM signals only)
    p10_mult = max(0.5, min(1.5, adjustment.get("p10_multiplier", 1.0)))
    p50_mult = max(0.7, min(1.4, adjustment.get("p50_multiplier", 1.0)))
    p90_mult = max(0.8, min(2.0, adjustment.get("p90_multiplier", 1.0)))

    # Forward velocity adjustment — dampen trend heavily.
    # A +150% velocity trend does NOT mean the next 180 days will average +60% above baseline.
    # Velocity trend is noisy (one viral video skews it). Dampen by 85%.
    # Cap at ±20% max adjustment — no channel sustains extreme trend for 180 days.
    trend_adj = 1.0 + (vel_trend_pct / 100) * 0.15
    trend_adj = max(0.75, min(1.20, trend_adj))

    timeframes = {}
    for days in [30, 90, 180, 365]:
        videos_in_period = max(1, round(days / cadence))

        # P50: best_base × LLM multiplier × velocity trend
        p50_proj = round(best_base * p50_mult * trend_adj * videos_in_period)
        # P10/P90: apply historical spread ratios with LLM adjustment
        p10_proj = round(p10_per_vid * p10_mult * trend_adj * videos_in_period)
        p90_proj = round(p90_per_vid * p90_mult * trend_adj * videos_in_period)

        # Sanity: ensure P10 <= P50 <= P90
        p10_proj = min(p10_proj, p50_proj)
        p90_proj = max(p90_proj, p50_proj)

        timeframes[f"{days}d"] = {
            "p10": max(0, p10_proj),
            "p50": max(0, p50_proj),
            "p90": max(0, p90_proj),
            "videos_count": videos_in_period,
        }

    # Viral video flag — if P90 is more than 5× P50, one outlier is inflating the ceiling
    viral_flag = None
    if p50_per_vid > 0 and p90_per_vid > p50_per_vid * 5:
        viral_flag = (
            f"P90 ({p90_per_vid:,} views) is {p90_per_vid // max(1, p50_per_vid)}× above P50 "
            f"({p50_per_vid:,} views) — one or more viral outliers may be inflating the optimistic forecast. "
            f"Base (P50) scenario is the most reliable estimate."
        )

    return {
        "base": {"p10": p10_per_vid, "p50": p50_per_vid, "p90": p90_per_vid, "last5_avg": last5_avg},
        "adjusted": {
            "p10": round(p10_per_vid * p10_mult),
            "p50": round(best_base * p50_mult),
            "p90": round(p90_per_vid * p90_mult),
        },
        "velocity": {
            "recent_views_per_day": recent_vpd,
            "older_views_per_day": older_vpd,
            "trend_pct": vel_trend_pct,
            "trend_multiplier_applied": round(trend_adj, 2),
        },
        "timeframes": timeframes,
        "adjustment_reasoning": adjustment.get("reasoning"),
        "viral_flag": viral_flag,
        "risk_flags": llm_result.get("risk_flags", []),
        "bullish_signals": llm_result.get("bullish_signals", []),
        "signal_flags": llm_result.get("signal_flags", {"trend": [], "social": []}),
    }


def _build_revenue_scenarios_180d(revenue_proxy: dict, forecast: dict) -> dict:
    """Build revenue scenarios for all campaign terms: 90d (3mo), 180d (6mo), 365d (12mo)."""
    rpm = revenue_proxy.get("effective_rpm_usd") or revenue_proxy.get("long_form", {}).get("adsense_cpm_usd", 1.5)
    tf = forecast.get("timeframes", {})

    def est_revenue(views: int) -> float:
        return round((views / 1000) * rpm, 2)

    def term_scenarios(period: str, desc_low: str, desc_base: str, desc_high: str) -> dict:
        t = tf.get(period, {})
        p10, p50, p90 = t.get("p10", 0), t.get("p50", 0), t.get("p90", 0)
        return {
            "low": {"views": p10, "revenue_usd": est_revenue(p10), "description": desc_low},
            "base": {"views": p50, "revenue_usd": est_revenue(p50), "description": desc_base},
            "high": {"views": p90, "revenue_usd": est_revenue(p90), "description": desc_high},
        }

    return {
        "90d": term_scenarios(
            "90d",
            "Conservative: reduced cadence or algorithm dip",
            "Expected: current cadence and engagement maintained",
            "Optimistic: strong topic momentum or breakout video",
        ),
        "180d": term_scenarios(
            "180d",
            "Conservative: slight slowdown over 6 months",
            "Expected: steady growth at current trajectory",
            "Optimistic: viral growth or new series launch",
        ),
        "365d": term_scenarios(
            "365d",
            "Conservative: seasonal dips, some slowdown",
            "Expected: sustained current trajectory over 12 months",
            "Optimistic: channel inflection — new audience breakthrough",
        ),
        # Keep 180d at top-level for backward compat
        "low": term_scenarios("180d", "", "", "")["low"],
        "base": term_scenarios("180d", "", "", "")["base"],
        "high": term_scenarios("180d", "", "", "")["high"],
    }


def _compute_confidence(
    youtube_data: dict,
    instagram_data: dict,
    trends_data: dict,
    news_data: dict,
    social_data: dict,
) -> dict:
    sources_ok = 0
    data_points = 0

    if not youtube_data.get("error"):
        sources_ok += 1
        videos = len(youtube_data.get("recent_videos", []))
        data_points += videos * 5 + 10  # ~5 metrics per video + channel stats

    if not instagram_data.get("error"):
        sources_ok += 1
        media = len(instagram_data.get("recent_media", []))
        data_points += media * 3 + 5

    if not trends_data.get("error"):
        # Google Trends tracks creator name popularity, not topic — weak signal for smaller creators
        # Count as 0.5 source weight rather than a full source
        sources_ok += 0.5
        data_points += len(trends_data.get("history", [])) + 2

    if not news_data.get("error"):
        sources_ok += 1
        data_points += len(news_data.get("articles", []))

    twitter = social_data.get("twitter", {})
    tiktok = social_data.get("tiktok", {})
    linkedin = social_data.get("linkedin", {})

    if twitter and not twitter.get("error"):
        sources_ok += 1
        data_points += twitter.get("tweets_fetched", 0) * 3

    if tiktok and not tiktok.get("error"):
        sources_ok += 1
        data_points += 10

    if linkedin and not linkedin.get("error"):
        sources_ok += 1
        data_points += 5

    # 40% base confidence + up to 60% from source coverage (7 sources)
    confidence_score = min(99, round(40 + (sources_ok / 7) * 60))

    return {"confidence_score": confidence_score, "data_points_count": data_points}
