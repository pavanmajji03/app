from __future__ import annotations

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    channel_input: str          # YouTube channel ID, handle (@name), or full URL
    instagram_username: str | None = None
    twitter_handle: str | None = None
    tiktok_handle: str | None = None
    linkedin_url: str | None = None


class CreatorOut(BaseModel):
    id: str
    youtube_channel_id: str | None
    name: str | None
    handle: str | None
    thumbnail_url: str | None

    class Config:
        from_attributes = True
