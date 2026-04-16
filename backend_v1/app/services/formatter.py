"""
Transforms raw analysis data into the clean AI underwriting report format.
"""
from __future__ import annotations

from datetime import datetime, timezone


def _fmt_number(n: int | float | None) -> str:
    if n is None:
        return "N/A"
    if n >= 1_000_000_000:
        return f"{n / 1_000_000_000:.1f}B"
    if n >= 1_000_000:
        return f"{n / 1_000_000:.2f}M".rstrip("0").rstrip(".")
    if n >= 1_000:
        return f"{n / 1_000:.1f}K".rstrip("0").rstrip(".")
    return str(round(n))


def _score_label(score: int) -> str:
    if score >= 85:
        return "Exceptional"
    if score >= 75:
        return "Strong"
    if score >= 60:
        return "Moderate"
    if score >= 45:
        return "Developing"
    return "Weak"


def _views_30d(recent_videos: list[dict]) -> int:
    """Sum views from videos published in the last 30 days."""
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None)
    total = 0
    for v in recent_videos:
        pub = v.get("published_at", "")
        try:
            pub_dt = datetime.fromisoformat(pub.replace("Z", ""))
            days_ago = (cutoff - pub_dt).days
            if days_ago <= 30:
                total += v.get("view_count", 0) or 0
        except Exception:
            pass
    return total


def _detect_niche_label(niche: str) -> str:
    """Build a human-readable niche label."""
    niche_map = {
        "finance": "Finance • Investing • Wealth",
        "business": "Business • Entrepreneurship • Startups",
        "tech": "Tech • Software • AI",
        "education": "Education • Learning • Tutorials",
        "health": "Health • Fitness • Wellness",
        "beauty": "Beauty • Fashion • Lifestyle",
        "food": "Food • Cooking • Recipes",
        "travel": "Travel • Vlogging • Lifestyle",
        "gaming": "Gaming • Esports • Entertainment",
        "entertainment": "Entertainment • Comedy • Viral",
        "general": "General • Lifestyle",
    }
    base = niche_map.get(niche, niche.title())

    return base


_OBSERVATION_WORDS = {"rising", "declining", "stable", "consistent", "single", "platform", "no ", "high ", "low ", "strong", "weak"}

def _trending_topics(trends_data: dict, forecast: dict) -> list[str]:
    topics = []
    if trends_data and not trends_data.get("error"):
        for q in (trends_data.get("rising_queries") or [])[:3]:
            topics.append(str(q))
        for q in (trends_data.get("top_queries") or [])[:3]:
            if q not in topics:
                topics.append(str(q))
    # Only include signal flags that look like topic keywords, not meta-observations
    signal_flags = (forecast or {}).get("signal_flags", {})
    for f in (signal_flags.get("trend") or [])[:3]:
        fl = f.lower()
        if f not in topics and not any(obs in fl for obs in _OBSERVATION_WORDS):
            topics.append(f)
    if not topics:
        topics = ["Insufficient trend data"]
    return topics[:6]


def _monthly_adsense_str(revenue_proxy: dict | None) -> str:
    if not revenue_proxy:
        return "N/A"
    avg = (revenue_proxy.get("combined_monthly_adsense") or {}).get("avg_usd")
    if avg is None:
        return "N/A"
    return f"${avg:,.0f}"




def build_report(
    youtube_data: dict | None,
    instagram_data: dict | None,
    trends_data: dict | None,
    social_data: dict | None,
    scores: dict | None,
    forecast: dict | None,
    revenue_proxy: dict | None,
    narrative: str | None,
    controversy_signals: dict | None,
) -> dict:
    yt = youtube_data or {}
    ch = yt.get("channel", {})
    metrics = yt.get("metrics", {})
    videos = yt.get("recent_videos", [])

    sc = scores or {}
    fc = forecast or {}
    rp = revenue_proxy or {}
    ig = instagram_data or {}
    ig_m = ig.get("metrics", {})
    sd = social_data or {}
    twitter = sd.get("twitter", {}) or {}
    tiktok = sd.get("tiktok", {}) or {}
    linkedin = sd.get("linkedin", {}) or {}

    # Claude-enriched fields — override API gaps with Claude's world knowledge
    enriched = sc.get("enriched", {}) or {}
    e_ig = enriched.get("instagram") or {}
    e_tw = enriched.get("twitter_x") or {}
    e_li = enriched.get("linkedin") or {}

    overall = sc.get("overall", 0)
    subs = ch.get("subscriber_count", 0) or 0
    total_views = ch.get("total_views", 0) or 0
    total_videos = ch.get("video_count", 0) or 0
    avg_views = metrics.get("avg_views", 0) or 0
    # Use decay-corrected velocity trend — this is the accurate growth signal.
    # growth_signal_pct (raw newest-half vs oldest-half of all 50 videos) is misleading
    # for daily uploaders where recent videos are still young and have low raw view counts.
    growth_pct = metrics.get("velocity_trend_pct", 0) or metrics.get("growth_signal_pct", 0) or 0
    cadence = metrics.get("upload_cadence_days") or 7

    views_30d = _views_30d(videos)
    niche = rp.get("niche_detected", "general")
    niche_label = enriched.get("niche_label") or _detect_niche_label(niche)
    location = enriched.get("location") or ch.get("country", "Unknown")

    long_form = [v for v in videos if not v.get("is_short")]
    shorts = [v for v in videos if v.get("is_short")]
    total_analyzed = len(long_form) + len(shorts)

    # --- View forecast in millions ---
    tf = fc.get("timeframes", {})

    def to_m(views: int) -> float:
        return round(views / 1_000_000, 1) if views else 0

    tf_30 = tf.get("30d", {})
    tf_90 = tf.get("90d", {})
    tf_180 = tf.get("180d", {})

    rpm = rp.get("estimated_rpm_usd") or (rp.get("long_form") or {}).get("adsense_rpm_usd") or (rp.get("long_form") or {}).get("adsense_cpm_usd") or 1.5

    def rev_str(views: int) -> str:
        return f"${round((views / 1000) * rpm):,}"

    # --- Social signals: prefer live API data, fall back to Claude's knowledge ---
    ig_followers = ig.get("followers_count", 0) or 0
    ig_er = ig_m.get("engagement_rate_pct", 0) or 0
    ig_ok = ig and not ig.get("error")

    tw_handle = twitter.get("handle") if twitter and not twitter.get("error") else None
    tw_followers = twitter.get("followers_count") if twitter and not twitter.get("error") else None
    tw_ok = twitter and not twitter.get("error")

    tk_m = (tiktok.get("metrics") or {}) if tiktok and not tiktok.get("error") else {}
    li_ok = linkedin and not linkedin.get("error")

    # Count active platforms using enriched knowledge as fallback
    ig_known = ig_ok or bool(e_ig.get("followers"))
    tw_known = tw_ok or bool(e_tw.get("handle"))
    li_known = li_ok or bool(e_li.get("url"))
    tk_known = bool(tk_m.get("followers"))

    active_platforms = sum([1, int(ig_known), int(tw_known), int(tk_known), int(li_known)])
    cross_platform = (
        "Excellent – multi-platform presence reduces single-platform risk" if active_platforms >= 3
        else "Moderate – present on 2 platforms" if active_platforms == 2
        else "Limited – YouTube only"
    )

    has_controversy = bool(
        (controversy_signals or {}).get("signals") and
        any(s.get("rating") == "bearish" for s in (controversy_signals or {}).get("signals", []))
    )

    # Build social signal objects — live API first, Claude knowledge fallback
    def _ig_obj():
        if ig_ok:
            return {
                "username": ig.get("username") or ig.get("name"),
                "followers": _fmt_number(ig_followers) if ig_followers else None,
                "engagement_rate": f"~{ig_er:.1f}%" if ig_er else None,
            }
        if e_ig:
            return {k: v for k, v in e_ig.items() if v is not None}
        return None

    def _tw_obj():
        if tw_ok:
            return {
                "handle": f"@{tw_handle}" if tw_handle else None,
                "followers": _fmt_number(tw_followers) if tw_followers else None,
                "bio": twitter.get("bio"),
            }
        if e_tw:
            return {k: v for k, v in e_tw.items() if v is not None}
        return None

    def _li_obj():
        if li_ok:
            return {"url": linkedin.get("url")}
        if e_li:
            return {k: v for k, v in e_li.items() if v is not None}
        return None

    ig_obj = _ig_obj()
    tw_obj = _tw_obj()
    li_obj = _li_obj()

    # --- Risk factors ---
    risk_factors = {
        "growth_trend": sc.get("growth", 0),
        "cadence_reliability": sc.get("consistency", 0),
        "platform_diversification": sc.get("platform_diversification", 0),
        "low_volatility_higher_is_better": sc.get("volatility", 0),
        "low_concentration_risk_higher_is_better": sc.get("concentration_risk", 0),
    }

    # --- Strengths / Watch factors from LLM ---
    bullish = fc.get("bullish_signals", [])
    risk_flags = fc.get("risk_flags", [])
    if not bullish:
        bullish = [f"Subscribers: {_fmt_number(subs)}", f"Avg views: {_fmt_number(avg_views)}"]
    if not risk_flags:
        risk_flags = ["Insufficient signal data for risk assessment"]

    # --- Trending topics: Claude's enriched list preferred over API ---
    e_topics = enriched.get("top_trending_topics") or []
    trending_topics = e_topics if e_topics else _trending_topics(trends_data, fc)
    e_momentum = enriched.get("trending_momentum")
    trend_momentum_base = "High" if sc.get("trend_alignment", 0) >= 70 else "Moderate" if sc.get("trend_alignment", 0) >= 50 else "Low"
    trend_momentum = e_momentum or trend_momentum_base

    # --- Cadence description ---
    cadence_desc = enriched.get("cadence_description") or f"Long-form every ~{cadence:.0f} {'day' if round(cadence) == 1 else 'days'}"

    # --- Confidence ---
    confidence = sc.get("confidence_score", 0)
    data_points = sc.get("data_points_count", 0)

    return {
        "ai_underwriting_report": {
            "channel_name": ch.get("name", "Unknown"),
            "handle": ch.get("handle", ""),
            "thumbnail_url": ch.get("thumbnail_url"),
            "niche": niche_label,
            "location": location,
            "subscribers": _fmt_number(subs),
            "avg_views": f"~{_fmt_number(avg_views)}",
            "growth_rate": f"+{growth_pct:.0f}%" if growth_pct >= 0 else f"{growth_pct:.0f}%",
            "ai_score": overall,
            "ai_score_label": _score_label(overall),
            "total_views": _fmt_number(total_views),
            "total_videos": f"{total_videos:,}+",
            "recent_performance": f"{_fmt_number(views_30d)} views in last 30 days",
        },
        "youtube_signals": {
            "subscribers": _fmt_number(subs),
            "total_views": _fmt_number(total_views),
            "recent_videos": f"{total_analyzed}+ (last 90 days)",
            "growth_rate": f"+{growth_pct:.0f}% (30-day)" if growth_pct >= 0 else f"{growth_pct:.0f}% (30-day)",
            "cadence": cadence_desc,
            "engagement_rate": f"{metrics.get('engagement_rate_pct', 0):.2f}%",
            "p10_p50_p90_views": {
                "p10": _fmt_number(metrics.get("p10_views", 0)),
                "p50": _fmt_number(metrics.get("p50_views", 0)),
                "p90": _fmt_number(metrics.get("p90_views", 0)),
            },
            "recent_videos_preview": [
                {
                    "title": v.get("title", "Untitled"),
                    "views": _fmt_number(v.get("view_count", 0) or 0),
                    "days_ago": max(0, (
                        datetime.now(timezone.utc).replace(tzinfo=None)
                        - datetime.fromisoformat(v["published_at"].replace("Z", ""))
                    ).days) if v.get("published_at") else 0,
                    "thumbnail": v.get("thumbnail_url"),
                }
                for v in [x for x in videos if not x.get("is_short")][:5]
            ],
            **({"notes": enriched["youtube_notes"]} if enriched.get("youtube_notes") else {}),
        },
        "social_signals": {
            **({"instagram": ig_obj} if ig_obj else {}),
            **({"twitter_x": tw_obj} if tw_obj else {}),
            **({"linkedin": li_obj} if li_obj else {}),
            "cross_platform_momentum": cross_platform,
            "no_controversy_flags": not has_controversy,
        },
        "trending_topics_analysis": {
            "analyzed": True,
            "top_trending_topics": trending_topics,
            "momentum": trend_momentum,
        },
        "view_forecast_millions": {
            "low_conservative": {
                "30d": to_m(tf_30.get("p10", 0)),
                "90d": to_m(tf_90.get("p10", 0)),
                "180d": to_m(tf_180.get("p10", 0)),
                "365d": to_m(tf.get("365d", {}).get("p10", 0)),
                "notes": "Conservative (P10): reduced cadence, algorithm dip, or topic fatigue",
            },
            "base_expected": {
                "30d": to_m(tf_30.get("p50", 0)),
                "90d": to_m(tf_90.get("p50", 0)),
                "180d": to_m(tf_180.get("p50", 0)),
                "365d": to_m(tf.get("365d", {}).get("p50", 0)),
                "notes": "Base (P35): realistic central tendency — most uploads perform near this level",
            },
            "high_optimistic": {
                "30d": to_m(tf_30.get("p90", 0)),
                "90d": to_m(tf_90.get("p90", 0)),
                "180d": to_m(tf_180.get("p90", 0)),
                "365d": to_m(tf.get("365d", {}).get("p90", 0)),
                "notes": "Optimistic (P75): strong momentum, good algorithm pickup, no major dips",
            },
        },
        "revenue_scenarios_adsense": {
            "90d": {
                "low":  {"views": _fmt_number(tf_90.get("p10", 0)), "estimated_revenue": rev_str(tf_90.get("p10", 0))},
                "base": {"views": _fmt_number(tf_90.get("p50", 0)), "estimated_revenue": rev_str(tf_90.get("p50", 0))},
                "high": {"views": _fmt_number(tf_90.get("p90", 0)), "estimated_revenue": rev_str(tf_90.get("p90", 0))},
            },
            "180d": {
                "low":  {"views": _fmt_number(tf_180.get("p10", 0)), "estimated_revenue": rev_str(tf_180.get("p10", 0))},
                "base": {"views": _fmt_number(tf_180.get("p50", 0)), "estimated_revenue": rev_str(tf_180.get("p50", 0))},
                "high": {"views": _fmt_number(tf_180.get("p90", 0)), "estimated_revenue": rev_str(tf_180.get("p90", 0))},
            },
            "365d": {
                "low":  {"views": _fmt_number(tf.get("365d", {}).get("p10", 0)), "estimated_revenue": rev_str(tf.get("365d", {}).get("p10", 0))},
                "base": {"views": _fmt_number(tf.get("365d", {}).get("p50", 0)), "estimated_revenue": rev_str(tf.get("365d", {}).get("p50", 0))},
                "high": {"views": _fmt_number(tf.get("365d", {}).get("p90", 0)), "estimated_revenue": rev_str(tf.get("365d", {}).get("p90", 0))},
            },
            "rpm_used": rpm,
            "rpm_reasoning": rp.get("rpm_reasoning", ""),
        },
        "campaign_readiness": {
            "overall_score": f"{overall}/100",
            "qualifies_for_campaign": overall >= 65,
            "message": (
                f"Your AI score of {overall}/100 qualifies you for a campaign. Set your terms and go live."
                if overall >= 65
                else f"Your AI score of {overall}/100 — below threshold. Monitor for improvement."
            ),
        },
        "risk_factor_analysis": risk_factors,
        "ai_assessment_summary": {
            "strengths": bullish,
            "watch_factors": risk_flags,
            "estimated_monthly_adsense_income": f"${round((tf_180.get('p50', 0) / 1000) * rpm / 6):,}",
            "confidence_score": confidence,
            "confidence_based_on": f"{data_points:,}+ data points",
            "narrative": narrative,
        },
    }
