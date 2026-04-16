import uuid

from sqlalchemy import Column, DateTime, Integer, JSON, String, Text, Uuid, func

from app.db.session import Base


class Creator(Base):
    __tablename__ = "creators"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    youtube_channel_id = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=True)
    handle = Column(String, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    # Onboarding inputs — persisted so the form can be pre-populated on re-run
    youtube_url = Column(String, nullable=True)
    instagram_username = Column(String, nullable=True)
    twitter_handle = Column(String, nullable=True)
    tiktok_handle = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    # Enriched from analysis — used by marketplace
    genres = Column(JSON, nullable=True)          # e.g. ["Tech", "AI", "Software"]
    niche = Column(String, nullable=True)         # e.g. "tech"
    ai_score = Column(Integer, nullable=True)
    risk_level = Column(String, nullable=True)    # Low / Low-Med / Medium / High
    subscribers_str = Column(String, nullable=True)  # e.g. "1.2M"
    avg_views_str = Column(String, nullable=True)    # e.g. "~45K"
    growth_rate_str = Column(String, nullable=True)  # e.g. "+12%"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
