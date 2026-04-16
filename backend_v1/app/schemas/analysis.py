from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class AnalysisJobOut(BaseModel):
    analysis_id: str
    creator_id: str
    status: str
    message: str = "Analysis started. Poll /analysis/{analysis_id} for results."


class AnalysisResultOut(BaseModel):
    analysis_id: str
    creator_id: str
    status: str

    # Formatted report (populated when status=completed)
    report: dict | None = None

    # Raw signals
    youtube_data: dict | None = None
    instagram_data: dict | None = None
    trends_data: dict | None = None
    news_data: dict | None = None
    social_data: dict | None = None
    life_events: dict | None = None
    controversy_signals: dict | None = None

    # Processed output
    scores: dict | None = None
    forecast: dict | None = None
    revenue_proxy: dict | None = None
    narrative: str | None = None
    error: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
