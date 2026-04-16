from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import declarative_base

from app.db.session import Base


class Genre(Base):
    __tablename__ = "genres"

    name = Column(String, primary_key=True)  # e.g. "Finance", "Gaming"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
