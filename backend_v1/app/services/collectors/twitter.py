from __future__ import annotations

import httpx

from app.core.config import settings

BASE_URL = "https://api.twitter.com/2"


async def collect(twitter_handle: str | None = None) -> dict:
    if not settings.twitter_bearer_token:
        return {"error": "Twitter bearer token not configured"}

    if not twitter_handle:
        return {"error": "Twitter handle not provided"}

    handle = twitter_handle.lstrip("@")
    headers = {"Authorization": f"Bearer {settings.twitter_bearer_token}"}

    async with httpx.AsyncClient(timeout=20) as client:
        try:
            # Step 1: resolve handle → user ID (free tier: no public_metrics)
            user_resp = await client.get(
                f"{BASE_URL}/users/by/username/{handle}",
                headers=headers,
                params={"user.fields": "description,verified,created_at"},
            )
            user_resp.raise_for_status()
            user_data = user_resp.json().get("data", {})
            if not user_data:
                return {"error": f"User @{handle} not found"}

            user_id = user_data["id"]

            # Step 2: fetch recent tweets
            tweets_resp = await client.get(
                f"{BASE_URL}/users/{user_id}/tweets",
                headers=headers,
                params={
                    "max_results": 20,
                    "tweet.fields": "public_metrics,created_at,text",
                    "exclude": "retweets,replies",
                },
            )
            tweets_resp.raise_for_status()
            tweets = tweets_resp.json().get("data", [])

            return {
                "handle": handle,
                "name": user_data.get("name"),
                "bio": user_data.get("description"),
                "verified": user_data.get("verified", False),
                "tweets_fetched": len(tweets),
                "tweets": tweets,
                "metrics": _compute_metrics(tweets),
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 402:
                return {"error": "Twitter API credits depleted. Free tier allows 1,500 tweet reads/month. Credits reset monthly."}
            return {"error": str(e)}
        except Exception as e:
            return {"error": str(e)}


def _compute_metrics(tweets: list[dict]) -> dict:
    if not tweets:
        return {}

    metrics = [t.get("public_metrics", {}) for t in tweets]
    likes = [m.get("like_count", 0) for m in metrics]
    retweets = [m.get("retweet_count", 0) for m in metrics]
    replies = [m.get("reply_count", 0) for m in metrics]
    impressions = [m.get("impression_count", 0) for m in metrics]

    return {
        "avg_likes": round(sum(likes) / len(likes)),
        "avg_retweets": round(sum(retweets) / len(retweets)),
        "avg_replies": round(sum(replies) / len(replies)),
        "avg_impressions": round(sum(impressions) / len(impressions)),
        "tweets_analyzed": len(tweets),
    }
