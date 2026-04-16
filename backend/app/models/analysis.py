import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, JSON, Text, Uuid
from sqlalchemy.orm import relationship

from app.db.session import Base


class AnalysisStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class CreatorAnalysis(Base):
    __tablename__ = "creator_analyses"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(Uuid(as_uuid=True), ForeignKey("creators.id"), nullable=False, index=True)
    status = Column(
        Enum("pending", "processing", "completed", "failed"),
        default="pending",
        nullable=False,
    )

    # Raw signals from each collector
    youtube_data = Column(JSON, nullable=True)
    instagram_data = Column(JSON, nullable=True)
    trends_data = Column(JSON, nullable=True)
    news_data = Column(JSON, nullable=True)
    social_data = Column(JSON, nullable=True)       # Apify: X, TikTok, LinkedIn
    life_events = Column(JSON, nullable=True)
    controversy_signals = Column(JSON, nullable=True)

    # Processed output
    scores = Column(JSON, nullable=True)            # per-category scores
    forecast = Column(JSON, nullable=True)          # P10/P50/P90
    revenue_proxy = Column(JSON, nullable=True)
    narrative = Column(Text, nullable=True)         # LLM-generated thesis
    error = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("Creator", backref="analyses")
