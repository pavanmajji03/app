from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Uuid

from app.db.session import Base


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(Uuid(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True)
    fan_email = Column(String, nullable=False, index=True)
    fan_name = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    invested_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
