from __future__ import annotations

import asyncio

import httpx

from app.core.config import settings

BASE_URL = "https://api.apify.com/v2"


async def _run_actor(client: httpx.AsyncClient, actor_id: str, input_data: dict) -> list[dict]:
    """Run an Apify actor synchronously (waits for completion).
    Apify URLs use ~ as separator, not /."""
    actor_path = actor_id.replace("/", "~")
    resp = await client.post(
        f"{BASE_URL}/acts/{actor_path}/run-sync-get-dataset-items",
        params={"token": settings.apify_api_key},
        json=input_data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


async def collect_twitter(creator_name: str, twitter_handle: str | None = None) -> dict:
    """Use native Twitter API v2 (bearer token). Apify not needed for Twitter."""
    from app.services.collectors.twitter import collect as twitter_collect
    return await twitter_collect(twitter_handle or creator_name)


async def collect_instagram(instagram_username: str | None = None) -> dict:
    if not settings.apify_api_key:
        return {"error": "Apify API key not configured"}

    if not instagram_username:
        return {"error": "Instagram username not provided"}

    async with httpx.AsyncClient() as client:
        try:
            # First call: profile details (includes followersCount + latestPosts)
            details = await _run_actor(
                client,
                settings.apify_actor_instagram,
                {
                    "directUrls": [f"https://www.instagram.com/{instagram_username}/"],
                    "resultsType": "details",
                },
            )
            profile = details[0] if details else {}

            # Second call: recent posts for engagement metrics
            post_items = await _run_actor(
                client,
                settings.apify_actor_instagram,
                {
                    "directUrls": [f"https://www.instagram.com/{instagram_username}/"],
                    "resultsType": "posts",
                    "resultsLimit": 20,
                },
            )
            posts = [p for p in (post_items or []) if "error" not in p]
            return _parse_instagram(instagram_username, profile, posts)
        except Exception as e:
            return {"error": str(e)}


async def collect_tiktok(tiktok_handle: str | None = None) -> dict:
    if not settings.apify_api_key:
        return {"error": "Apify API key not configured"}

    if not tiktok_handle:
        return {"error": "TikTok handle not provided"}

    async with httpx.AsyncClient() as client:
        try:
            items = await _run_actor(
                client,
                settings.apify_actor_tiktok,
                {"profiles": [tiktok_handle], "resultsPerPage": 20},
            )
            first = items[0] if items else {}
            return {
                "handle": tiktok_handle,
                "metrics": _tiktok_metrics(first),
                "recent_videos": len(items),
            }
        except Exception as e:
            return {"error": str(e)}


async def collect_linkedin(linkedin_url: str | None = None) -> dict:
    if not settings.apify_api_key:
        return {"error": "Apify API key not configured"}

    if not linkedin_url:
        return {"error": "LinkedIn URL not provided"}

    async with httpx.AsyncClient() as client:
        try:
            items = await _run_actor(
                client,
                settings.apify_actor_linkedin,
                {"profileUrls": [linkedin_url]},
            )
            return {
                "url": linkedin_url,
                "raw": items[0] if items else {},
            }
        except Exception as e:
            return {"error": str(e)}


def _parse_instagram(username: str, profile: dict, posts: list[dict]) -> dict:
    # resultsType="details" fields
    owner = profile.get("username") or profile.get("ownerUsername") or username
    followers = profile.get("followersCount", 0) or 0
    follows = profile.get("followsCount", 0) or 0
    biography = profile.get("biography", "")
    full_name = profile.get("fullName", "") or profile.get("ownerFullName", "")
    media_count = profile.get("postsCount", len(posts))

    likes = [p.get("likesCount", 0) or 0 for p in posts]
    comments = [p.get("commentsCount", 0) or 0 for p in posts]
    avg_likes = sum(likes) / len(likes) if likes else 0
    avg_comments = sum(comments) / len(comments) if comments else 0
    engagement_rate = ((avg_likes + avg_comments) / followers * 100) if followers > 0 else 0

    reels = [p for p in posts if p.get("type") == "Video"]
    images = [p for p in posts if p.get("type") == "Image"]
    carousels = [p for p in posts if p.get("type") == "Sidecar"]

    return {
        "username": owner,
        "name": full_name,
        "biography": biography,
        "followers_count": followers,
        "follows_count": follows,
        "media_count": media_count,
        "recent_media": posts[:20],
        "metrics": {
            "avg_likes": round(avg_likes),
            "avg_comments": round(avg_comments),
            "engagement_rate_pct": round(engagement_rate, 2),
            "reels_count": len(reels),
            "images_count": len(images),
            "carousels_count": len(carousels),
            "posts_analyzed": len(posts),
        },
    }



def _tiktok_metrics(item: dict) -> dict:
    # Actor returns video items — author stats are in authorMeta
    author = item.get("authorMeta", {})
    return {
        "followers": author.get("fans"),
        "following": author.get("following"),
        "total_likes": author.get("heart"),
        "video_count": author.get("video"),
        "verified": author.get("verified"),
        "nickname": author.get("nickName"),
        "bio": author.get("signature"),
    }


async def collect(
    creator_name: str,
    twitter_handle: str | None = None,
    tiktok_handle: str | None = None,
    linkedin_url: str | None = None,
) -> dict:
    """Run all Apify collectors in parallel."""
    twitter_data, tiktok_data, linkedin_data = await asyncio.gather(
        collect_twitter(creator_name, twitter_handle),
        collect_tiktok(tiktok_handle),
        collect_linkedin(linkedin_url),
    )

    return {
        "twitter": twitter_data,
        "tiktok": tiktok_data,
        "linkedin": linkedin_data,
    }
