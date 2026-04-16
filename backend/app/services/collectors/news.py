import httpx

from app.core.config import settings

NEWSAPI_URL = "https://newsapi.org/v2/everything"
SERPER_URL = "https://google.serper.dev/search"


async def _fetch_newsapi(client: httpx.AsyncClient, creator_name: str) -> list[dict]:
    if not settings.news_api_key:
        return []

    resp = await client.get(
        NEWSAPI_URL,
        params={
            "q": creator_name,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": 10,
        },
        headers={"X-Api-Key": settings.news_api_key},
    )
    resp.raise_for_status()
    articles = resp.json().get("articles", [])

    return [
        {
            "source": a.get("source", {}).get("name"),
            "title": a.get("title"),
            "description": a.get("description"),
            "url": a.get("url"),
            "published_at": a.get("publishedAt"),
            "sentiment": None,  # filled by LLM later
        }
        for a in articles
    ]


async def _fetch_serper(client: httpx.AsyncClient, creator_name: str) -> list[dict]:
    if not settings.serper_api_key:
        return []

    resp = await client.post(
        SERPER_URL,
        json={"q": f"{creator_name} controversy OR news OR trending", "num": 10},
        headers={"X-API-KEY": settings.serper_api_key, "Content-Type": "application/json"},
    )
    resp.raise_for_status()
    results = resp.json().get("organic", [])

    return [
        {
            "title": r.get("title"),
            "snippet": r.get("snippet"),
            "link": r.get("link"),
            "date": r.get("date"),
        }
        for r in results
    ]


async def collect(creator_name: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        news_articles, web_results = [], []

        try:
            news_articles = await _fetch_newsapi(client, creator_name)
        except Exception as e:
            news_articles = [{"error": str(e)}]

        try:
            web_results = await _fetch_serper(client, creator_name)
        except Exception as e:
            web_results = [{"error": str(e)}]

        return {
            "creator_name": creator_name,
            "news_articles": news_articles,
            "web_results": web_results,
            "total_news_hits": len(news_articles),
            "total_web_hits": len(web_results),
        }
