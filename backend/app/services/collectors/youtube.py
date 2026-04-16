from __future__ import annotations

import re
from datetime import datetime, timezone

import httpx

from app.core.config import settings

BASE_URL = "https://www.googleapis.com/youtube/v3"


def _parse_channel_input(channel_input: str) -> dict:
    """
    Accept channel ID (UCxxx), handle (@name), or full YouTube URL.
    Returns dict with resolved type and value.
    """
    channel_input = channel_input.strip()

    # Full URL patterns
    handle_match = re.search(r"youtube\.com/@([\w.]+)", channel_input)
    if handle_match:
        return {"type": "handle", "value": f"@{handle_match.group(1)}"}

    channel_url_match = re.search(r"youtube\.com/channel/(UC[\w-]+)", channel_input)
    if channel_url_match:
        return {"type": "id", "value": channel_url_match.group(1)}

    # Bare handle
    if channel_input.startswith("@"):
        return {"type": "handle", "value": channel_input}

    # Bare channel ID
    if channel_input.startswith("UC"):
        return {"type": "id", "value": channel_input}

    # Fallback: treat as handle
    return {"type": "handle", "value": f"@{channel_input}"}


async def _resolve_channel_id(client: httpx.AsyncClient, channel_input: str) -> str | None:
    parsed = _parse_channel_input(channel_input)

    if parsed["type"] == "id":
        return parsed["value"]

    # Resolve handle to channel ID via search
    resp = await client.get(
        f"{BASE_URL}/search",
        params={
            "part": "snippet",
            "q": parsed["value"],
            "type": "channel",
            "maxResults": 1,
            "key": settings.youtube_api_key,
        },
    )
    resp.raise_for_status()
    items = resp.json().get("items", [])
    if not items:
        return None
    return items[0]["snippet"]["channelId"]


async def _fetch_channel_metadata(client: httpx.AsyncClient, channel_id: str) -> dict:
    resp = await client.get(
        f"{BASE_URL}/channels",
        params={
            "part": "snippet,statistics,brandingSettings,contentDetails",
            "id": channel_id,
            "key": settings.youtube_api_key,
        },
    )
    resp.raise_for_status()
    items = resp.json().get("items", [])
    if not items:
        return {}

    item = items[0]
    snippet = item.get("snippet", {})
    stats = item.get("statistics", {})
    branding = item.get("brandingSettings", {}).get("channel", {})

    return {
        "channel_id": channel_id,
        "name": snippet.get("title"),
        "handle": snippet.get("customUrl"),
        "description": snippet.get("description"),
        "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url"),
        "country": snippet.get("country"),
        "published_at": snippet.get("publishedAt"),
        "subscriber_count": int(stats.get("subscriberCount", 0)),
        "video_count": int(stats.get("videoCount", 0)),
        "total_views": int(stats.get("viewCount", 0)),
        "keywords": branding.get("keywords"),
    }


async def _fetch_recent_videos(client: httpx.AsyncClient, channel_id: str, max_results: int = 50) -> list[dict]:
    # Get uploads playlist ID
    resp = await client.get(
        f"{BASE_URL}/channels",
        params={
            "part": "contentDetails",
            "id": channel_id,
            "key": settings.youtube_api_key,
        },
    )
    resp.raise_for_status()
    items = resp.json().get("items", [])
    if not items:
        return []

    uploads_playlist = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

    # Get video IDs from uploads playlist
    resp = await client.get(
        f"{BASE_URL}/playlistItems",
        params={
            "part": "contentDetails,snippet",
            "playlistId": uploads_playlist,
            "maxResults": max_results,
            "key": settings.youtube_api_key,
        },
    )
    resp.raise_for_status()
    playlist_items = resp.json().get("items", [])
    video_ids = [item["contentDetails"]["videoId"] for item in playlist_items]

    if not video_ids:
        return []

    # Fetch full stats for each video
    resp = await client.get(
        f"{BASE_URL}/videos",
        params={
            "part": "snippet,statistics,contentDetails",
            "id": ",".join(video_ids),
            "key": settings.youtube_api_key,
        },
    )
    resp.raise_for_status()

    videos = []
    for item in resp.json().get("items", []):
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})
        duration = item.get("contentDetails", {}).get("duration", "")
        # Flag Shorts: duration <= 60s (PT60S or less)
        is_short = _is_short(duration)
        videos.append({
            "video_id": item["id"],
            "title": snippet.get("title"),
            "description": snippet.get("description", "")[:500],
            "published_at": snippet.get("publishedAt"),
            "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url"),
            "tags": snippet.get("tags", []),
            "view_count": int(stats.get("viewCount", 0)),
            "like_count": int(stats.get("likeCount", 0)),
            "comment_count": int(stats.get("commentCount", 0)),
            "duration": duration,
            "is_short": is_short,
        })

    return videos


def _is_short(duration: str) -> bool:
    """Returns True if ISO 8601 duration is <= 60 seconds."""
    import re as _re
    if not duration:
        return False
    m = _re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not m:
        return False
    hours = int(m.group(1) or 0)
    minutes = int(m.group(2) or 0)
    seconds = int(m.group(3) or 0)
    total = hours * 3600 + minutes * 60 + seconds
    return total <= 60


def _channel_tier(subscriber_count: int) -> str:
    """VidIQ-style channel tier classification."""
    if subscriber_count >= 10_000_000:
        return "mega"
    elif subscriber_count >= 1_000_000:
        return "large"
    elif subscriber_count >= 100_000:
        return "mid"
    elif subscriber_count >= 10_000:
        return "micro"
    else:
        return "nano"


def _compute_metrics(channel: dict, videos: list[dict]) -> dict:
    if not videos:
        return {}

    # Separate Shorts from long-form for cleaner metrics
    long_form = [v for v in videos if not v.get("is_short")]
    shorts = [v for v in videos if v.get("is_short")]

    # Use long-form for primary metrics if available, else fall back to all
    primary = long_form if long_form else videos

    like_counts = [v["like_count"] for v in primary]
    comment_counts = [v["comment_count"] for v in primary]

    # --- Step 1: Compute velocity_30d_est for ALL videos FIRST ---
    # This must happen before percentiles so we use age-corrected views, not raw lifetime counts.
    # YouTube view decay: ~65% of views arrive in first 30 days.
    # A 2-year-old video with 2M views didn't get 2M in its first 30 days — maybe 400K.
    # A 3-day-old video with 50K views will likely hit 200K by day 30.
    # Using raw view_count for P50 mixes these cases and destroys forecast accuracy.
    now = datetime.now(timezone.utc)

    DECAY_30D = 0.65   # ~65% of lifetime views arrive in first 30 days
    DECAY_60D = 0.80
    DECAY_90D = 0.88
    DECAY_180D = 0.94

    for v in primary:
        pub = v.get("published_at")
        if not pub:
            v["views_per_day"] = None
            v["days_live"] = None
            v["velocity_30d_est"] = None
            continue
        pub_dt = datetime.fromisoformat(pub.replace("Z", "+00:00"))
        days_live = max(1, (now - pub_dt).days)
        v["days_live"] = days_live
        raw_vpd = v["view_count"] / days_live

        if days_live <= 3:
            # Very fresh (1-3 days) — first 3 days capture ~35% of 30d views for most content
            v["velocity_30d_est"] = round(v["view_count"] / 0.35)
        elif days_live <= 7:
            # Days 4-7 — spike mostly done; first 7 days ≈ 60% of 30d views
            v["velocity_30d_est"] = round(v["view_count"] / 0.60)
        elif days_live <= 30:
            v["velocity_30d_est"] = v["view_count"]
        elif days_live <= 60:
            v["velocity_30d_est"] = round(v["view_count"] * (DECAY_30D / DECAY_60D))
        elif days_live <= 90:
            v["velocity_30d_est"] = round(v["view_count"] * (DECAY_30D / DECAY_90D))
        elif days_live <= 180:
            v["velocity_30d_est"] = round(v["view_count"] * (DECAY_30D / DECAY_180D))
        else:
            # Old video — 65% of lifetime came in first 30 days
            v["velocity_30d_est"] = round(v["view_count"] * DECAY_30D)

        v["views_per_day"] = round(raw_vpd, 1)

    # --- Step 2: Upload cadence (must come BEFORE percentile window so adaptive floor works) ---
    cadence_days = None
    cadence_source = long_form if long_form else videos
    dated_cadence = [v for v in cadence_source if v.get("published_at")]
    if len(dated_cadence) >= 2:
        dates_c = sorted(
            [datetime.fromisoformat(v["published_at"].replace("Z", "+00:00")) for v in dated_cadence],
            reverse=True,
        )
        gaps = [(dates_c[i] - dates_c[i + 1]).days for i in range(len(dates_c) - 1)]
        cadence_days = round(sum(gaps) / len(gaps), 1)

    # --- Step 3: Percentiles from recent MATURE videos only ---
    # Maturity floor: videos need enough real data (not just day-1 spike).
    # Adaptive: for daily uploaders, floor = 2× cadence (e.g. 2 days for daily creators)
    # For weekly uploaders, floor = 14 days.
    # Ceiling: 180 days — older videos don't represent today's channel.
    maturity_floor = 14  # default for weekly/biweekly uploaders
    if cadence_days and cadence_days < 3:
        maturity_floor = max(4, round(cadence_days * 3))   # daily → 3-4 days
    elif cadence_days and cadence_days < 7:
        maturity_floor = max(7, round(cadence_days * 2))   # 2-6 day cadence → ~7 days

    primary_with_age = sorted(
        [
            v for v in primary
            if v.get("days_live") is not None
            and v.get("velocity_30d_est") is not None
            and maturity_floor <= v["days_live"] <= 180
        ],
        key=lambda x: x["days_live"]
    )
    recent_window = primary_with_age[:20] if len(primary_with_age) >= 5 else primary_with_age

    # Fallback: relax ceiling to 365 days if not enough videos
    if len(recent_window) < 5:
        recent_window = sorted(
            [v for v in primary if v.get("days_live") is not None
             and v.get("velocity_30d_est") is not None
             and v["days_live"] >= maturity_floor],
            key=lambda x: x["days_live"]
        )[:20]

    # Final fallback: any video ≥ 3 days
    if len(recent_window) < 3:
        recent_window = sorted(
            [v for v in primary if v.get("days_live") is not None
             and v.get("velocity_30d_est") is not None
             and v["days_live"] >= 3],
            key=lambda x: x["days_live"]
        )[:20]

    v30_counts = [v["velocity_30d_est"] for v in recent_window]
    view_counts = [v["view_count"] for v in primary]

    if not v30_counts:
        v30_counts = view_counts

    avg_views = sum(view_counts) / len(view_counts)
    avg_likes = sum(like_counts) / len(like_counts)
    avg_comments = sum(comment_counts) / len(comment_counts)

    engagement_rate = (avg_likes + avg_comments) / avg_views * 100 if avg_views > 0 else 0

    # --- IQR-based outlier removal for percentiles ---
    # Standard stats approach: remove values above Q3 + 1.5×IQR as viral outliers.
    # This is more principled than "drop top 20%" — it adapts to the actual spread.
    # A creator with consistent 300K videos won't have any removed;
    # a creator with 15×300K and 2×5M will have the 5M videos excluded.
    sorted_v30 = sorted(v30_counts)
    n = len(sorted_v30)
    q1 = sorted_v30[max(0, int(n * 0.25) - 1)]
    q3 = sorted_v30[min(n - 1, int(n * 0.75))]
    iqr = q3 - q1
    upper_fence = q3 + 1.5 * iqr

    non_outliers = [v for v in sorted_v30 if v <= upper_fence]
    if len(non_outliers) < 3:
        non_outliers = sorted_v30  # don't remove if it leaves too few

    m = len(non_outliers)
    p10 = non_outliers[max(0, int(m * 0.15) - 1)]   # Conservative: typical bad stretch
    p50 = non_outliers[max(0, int(m * 0.50) - 1)]   # Base: true median (no viral inflation)
    p90 = non_outliers[min(m - 1, int(m * 0.85))]   # Optimistic: strong-but-normal performance

    # Per-video performance vs channel average
    for v in primary:
        v["vs_avg_ratio"] = round(v["view_count"] / max(1, avg_views), 2)

    # Sort primary newest-first for velocity trend computation
    primary_dated = sorted(
        [v for v in primary if v.get("days_live") is not None],
        key=lambda x: x["days_live"]  # ascending days_live = newest first
    )

    # Velocity trend — MATURE videos only (≥ maturity_floor days old).
    # Using fresh videos corrupts this: a 2-day video extrapolated to 30d appears
    # to have far higher velocity than a 20-day video with real data, creating fake
    # "growth" signals. Only compare videos that have accumulated real view data.
    mature_for_trend = sorted(
        [v for v in primary if v.get("days_live", 0) >= maturity_floor and v.get("velocity_30d_est")],
        key=lambda x: x["days_live"]  # ascending = newest mature first
    )
    recent_vids = mature_for_trend[:10]
    older_vids = mature_for_trend[10:30]

    recent_v30 = [v["velocity_30d_est"] for v in recent_vids if v.get("velocity_30d_est")]
    older_v30 = [v["velocity_30d_est"] for v in older_vids if v.get("velocity_30d_est")]

    recent_avg_vpd = round(sum(recent_v30) / max(1, len(recent_v30)) / 30, 1)
    older_avg_vpd = round(sum(older_v30) / max(1, len(older_v30)) / 30, 1) if older_v30 else recent_avg_vpd
    velocity_trend_pct = round((recent_avg_vpd - older_avg_vpd) / max(1, older_avg_vpd) * 100, 1)

    # Most recent 5 MATURE videos (≥ maturity_floor days) for last5_avg.
    # Using very fresh videos for last5_avg is unreliable even with decay correction —
    # extrapolating a 2-day-old video's 30d performance has wide error bars.
    # Prefer mature recent videos which have real accumulated data.
    mature_recent = [v for v in primary_dated if v.get("days_live", 0) >= maturity_floor and v.get("velocity_30d_est")]
    if len(mature_recent) >= 3:
        last5_v30 = [v["velocity_30d_est"] for v in mature_recent[:5]]
    else:
        # Fallback: use all recent with decay correction
        last5_v30 = [v["velocity_30d_est"] for v in primary_dated[:5] if v.get("velocity_30d_est")]
    last5_avg = round(sum(last5_v30) / len(last5_v30)) if last5_v30 else 0

    # Legacy growth signal (newest raw views vs oldest, for backward compat)
    mid = n // 2
    recent_raw = [v["view_count"] for v in primary[:mid]] if mid > 0 else view_counts
    older_raw = [v["view_count"] for v in primary[mid:]] if mid > 0 else view_counts
    recent_avg_raw = sum(recent_raw) / max(1, len(recent_raw))
    older_avg_raw = sum(older_raw) / max(1, len(older_raw))
    growth_signal = round((recent_avg_raw - older_avg_raw) / max(1, older_avg_raw) * 100, 1)

    # Channel tier
    subs = channel.get("subscriber_count", 0)
    tier = _channel_tier(subs)

    return {
        "subscriber_count": subs,
        "channel_tier": tier,
        "avg_views": round(avg_views),
        "avg_likes": round(avg_likes),
        "avg_comments": round(avg_comments),
        "engagement_rate_pct": round(engagement_rate, 2),
        "p10_views": p10,
        "p50_views": p50,
        "p90_views": p90,
        "upload_cadence_days": cadence_days,
        "growth_signal_pct": growth_signal,
        # VidIQ-style velocity (decay-corrected)
        "recent_avg_views_per_day": recent_avg_vpd,
        "older_avg_views_per_day": older_avg_vpd,
        "velocity_trend_pct": velocity_trend_pct,
        "last5_avg_views": last5_avg,
        "videos_analyzed": n,
        "long_form_count": len(long_form),
        "shorts_count": len(shorts),
    }


async def collect(channel_input: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        channel_id = await _resolve_channel_id(client, channel_input)
        if not channel_id:
            return {"error": f"Could not resolve channel: {channel_input}"}

        channel = await _fetch_channel_metadata(client, channel_id)
        videos = await _fetch_recent_videos(client, channel_id)
        metrics = _compute_metrics(channel, videos)

        return {
            "channel": channel,
            "recent_videos": videos,
            "metrics": metrics,
        }
