import asyncio
import time
from functools import partial

from pytrends.request import TrendReq


def _sync_collect(creator_name: str) -> dict:
    for attempt in range(3):
        try:
            if attempt > 0:
                time.sleep(5 * attempt)  # 5s, 10s backoff
            pytrends = TrendReq(hl="en-US", tz=0)
            pytrends.build_payload([creator_name], timeframe="today 3-m")
            return _parse_trends(pytrends, creator_name)
        except Exception as e:
            if attempt == 2:
                return {"error": str(e), "creator_name": creator_name}
    return {"error": "Failed after retries", "creator_name": creator_name}


def _parse_trends(pytrends: TrendReq, creator_name: str) -> dict:
    try:

        interest_over_time = pytrends.interest_over_time()
        related_queries = pytrends.related_queries()

        if interest_over_time.empty:
            return {"error": "No trend data found", "creator_name": creator_name}

        series = interest_over_time[creator_name]
        values = series.tolist()
        dates = [str(d.date()) for d in interest_over_time.index]

        current_score = values[-1] if values else 0
        avg_score = round(sum(values) / len(values), 1) if values else 0
        peak_score = max(values) if values else 0

        # Trend direction: compare last 2 weeks vs prior 2 weeks
        recent = values[-14:] if len(values) >= 14 else values
        prior = values[-28:-14] if len(values) >= 28 else values
        recent_avg = sum(recent) / len(recent) if recent else 0
        prior_avg = sum(prior) / len(prior) if prior else 0
        trend_direction = "rising" if recent_avg > prior_avg else "declining" if recent_avg < prior_avg else "stable"

        # Top related queries
        top_queries = []
        rq = related_queries.get(creator_name, {})
        top_df = rq.get("top")
        if top_df is not None and not top_df.empty:
            top_queries = top_df.head(5)["query"].tolist()

        return {
            "creator_name": creator_name,
            "current_score": current_score,
            "avg_score_90d": avg_score,
            "peak_score_90d": peak_score,
            "trend_direction": trend_direction,
            "top_related_queries": top_queries,
            "history": [{"date": d, "score": v} for d, v in zip(dates, values)],
        }

    except Exception as e:
        return {"error": str(e), "creator_name": creator_name}


async def collect(creator_name: str) -> dict:
    # pytrends is sync — run in thread pool to avoid blocking
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(_sync_collect, creator_name))
