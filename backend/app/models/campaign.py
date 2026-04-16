from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Uuid, func

from app.db.session import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(Uuid(as_uuid=True), ForeignKey("creators.id"), nullable=False, index=True)
    analysis_id = Column(Uuid(as_uuid=True), ForeignKey("creator_analyses.id"), nullable=True, index=True)
    term_months = Column(Integer, nullable=False)
    revenue_share_pct = Column(Float, nullable=False)
    target_amount = Column(Float, nullable=False)
    raised_amount = Column(Float, nullable=False, default=0.0)
    investor_count = Column(Integer, nullable=False, default=0)
    start_date = Column(String, nullable=True)  # ISO date string YYYY-MM-DD
    status = Column(
        Enum("draft", "live", "completed"),
        default="live",
        nullable=False,
    )
    # Return projections copied from analysis at time of campaign creation
    return_low = Column(Float, nullable=True)
    return_base = Column(Float, nullable=True)
    return_high = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
