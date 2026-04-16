from __future__ import annotations

import httpx

from app.core.config import settings

BASE_URL = f"https://graph.facebook.com/{settings.instagram_api_version}"


async def collect(instagram_username: str | None = None) -> dict:
    """
    Try Meta Business Discovery API first; fall back to Apify Instagram scraper.
    """
    if not instagram_username:
        return {"error": "No Instagram username provided"}

    # Try Meta Business Discovery API first (requires linked Business account)
    if settings.instagram_access_token and settings.instagram_business_account_id:
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                return await _fetch_by_username(client, instagram_username)
            except Exception:
                pass  # Fall through to Apify

    # Fallback: Apify Instagram scraper (works for any public account)
    from app.services.collectors.apify import collect_instagram
    return await collect_instagram(instagram_username)


async def _fetch_by_username(client: httpx.AsyncClient, username: str) -> dict:
    resp = await client.get(
        f"{BASE_URL}/{settings.instagram_business_account_id}",
        params={
            "fields": (
                "business_discovery.fields("
                "id,name,username,biography,followers_count,follows_count,"
                "media_count,profile_picture_url,website,"
                "media{id,caption,media_type,timestamp,like_count,comments_count,permalink}"
                ")"
            ),
            "username": username,
            "access_token": settings.instagram_access_token,
        },
    )
    resp.raise_for_status()
    data = resp.json().get("business_discovery", {})

    media_items = data.get("media", {}).get("data", [])
    followers = data.get("followers_count", 0)
    metrics = _compute_metrics(media_items, followers)

    return {
        "username": data.get("username"),
        "name": data.get("name"),
        "biography": data.get("biography"),
        "followers_count": followers,
        "follows_count": data.get("follows_count"),
        "media_count": data.get("media_count"),
        "website": data.get("website"),
        "profile_picture_url": data.get("profile_picture_url"),
        "recent_media": media_items[:20],
        "metrics": metrics,
    }


def _compute_metrics(media_items: list[dict], followers: int) -> dict:
    if not media_items:
        return {}

    likes = [m.get("like_count", 0) for m in media_items]
    comments = [m.get("comments_count", 0) for m in media_items]

    avg_likes = sum(likes) / len(likes)
    avg_comments = sum(comments) / len(comments)
    engagement_rate = ((avg_likes + avg_comments) / followers * 100) if followers > 0 else 0

    reels = [m for m in media_items if m.get("media_type") == "VIDEO"]
    images = [m for m in media_items if m.get("media_type") == "IMAGE"]
    carousels = [m for m in media_items if m.get("media_type") == "CAROUSEL_ALBUM"]

    return {
        "avg_likes": round(avg_likes),
        "avg_comments": round(avg_comments),
        "engagement_rate_pct": round(engagement_rate, 2),
        "reels_count": len(reels),
        "images_count": len(images),
        "carousels_count": len(carousels),
        "posts_analyzed": len(media_items),
    }
