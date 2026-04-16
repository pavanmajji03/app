from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class CreateCampaignRequest(BaseModel):
    analysis_id: str
    term_months: int
    revenue_share_pct: float
    target_amount: float
    start_date: Optional[str] = None   # ISO date YYYY-MM-DD
    return_low: Optional[float] = None
    return_base: Optional[float] = None
    return_high: Optional[float] = None


class InvestRequest(BaseModel):
    fan_email: str
    fan_name: Optional[str] = None
    amount: float
