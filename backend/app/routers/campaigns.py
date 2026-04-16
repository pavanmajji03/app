from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.analysis import CreatorAnalysis
from app.models.campaign import Campaign
from app.models.creator import Creator
from app.models.investment import Investment
from app.schemas.campaign import CreateCampaignRequest, InvestRequest

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def _campaign_to_dict(c: Campaign) -> dict:
    return {
        "campaign_id": str(c.id),
        "creator_id": str(c.creator_id),
        "analysis_id": str(c.analysis_id) if c.analysis_id else None,
        "term_months": c.term_months,
        "revenue_share_pct": c.revenue_share_pct,
        "target_amount": c.target_amount,
        "raised_amount": c.raised_amount,
        "investor_count": c.investor_count,
        "start_date": c.start_date,
        "status": c.status,
        "return_low": c.return_low,
        "return_base": c.return_base,
        "return_high": c.return_high,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.post("", status_code=201)
async def create_campaign(
    request: CreateCampaignRequest,
    db: AsyncSession = Depends(get_db),
):
    """Creator publishes a campaign. analysis_id is used to look up creator_id."""
    # Look up the analysis to get creator_id
    result = await db.execute(
        select(CreatorAnalysis).where(CreatorAnalysis.id == uuid.UUID(request.analysis_id))
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if analysis.status != "completed":
        raise HTTPException(status_code=400, detail="Analysis must be completed before creating a campaign")

    campaign = Campaign(
        id=uuid.uuid4(),
        creator_id=analysis.creator_id,
        analysis_id=analysis.id,
        term_months=request.term_months,
        revenue_share_pct=request.revenue_share_pct,
        target_amount=request.target_amount,
        start_date=request.start_date,
        status="live",
        raised_amount=0.0,
        investor_count=0,
        return_low=request.return_low,
        return_base=request.return_base,
        return_high=request.return_high,
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)

    return {
        "status": "success",
        "message": "Campaign published successfully",
        "data": _campaign_to_dict(campaign),
    }


@router.get("")
async def list_campaigns(db: AsyncSession = Depends(get_db)):
    """List all live campaigns with creator metadata (marketplace)."""
    result = await db.execute(
        select(Campaign, Creator)
        .join(Creator, Campaign.creator_id == Creator.id)
        .where(Campaign.status == "live")
        .order_by(Campaign.created_at.desc())
    )
    rows = result.all()
    items = []
    for campaign, creator in rows:
        d = _campaign_to_dict(campaign)
        d["creator_name"] = creator.name or ""
        d["creator_handle"] = creator.handle or ""
        d["creator_thumbnail"] = creator.thumbnail_url or ""
        d["ai_score"] = creator.ai_score or 0
        d["risk_level"] = creator.risk_level or "Medium"
        d["genres"] = creator.genres or []
        d["niche"] = creator.niche or "general"
        d["subscribers"] = creator.subscribers_str or ""
        d["avg_views"] = creator.avg_views_str or ""
        d["growth_rate"] = creator.growth_rate_str or ""
        items.append(d)
    return {
        "status": "success",
        "message": f"{len(items)} campaigns found",
        "data": items,
    }


@router.get("/by-analysis/{analysis_id}")
async def get_campaign_by_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    """Get a creator's campaign by their analysis_id."""
    result = await db.execute(
        select(Campaign)
        .where(Campaign.analysis_id == uuid.UUID(analysis_id))
        .order_by(Campaign.created_at.desc())
    )
    campaign = result.scalars().first()
    if not campaign:
        raise HTTPException(status_code=404, detail="No campaign found for this analysis")
    return {
        "status": "success",
        "message": "Campaign found",
        "data": _campaign_to_dict(campaign),
    }


@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single campaign by ID, enriched with creator info."""
    result = await db.execute(
        select(Campaign, Creator)
        .join(Creator, Campaign.creator_id == Creator.id)
        .where(Campaign.id == uuid.UUID(campaign_id))
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign, creator = row
    d = _campaign_to_dict(campaign)
    d["creator_name"] = creator.name or ""
    d["creator_handle"] = creator.handle or ""
    d["creator_thumbnail"] = creator.thumbnail_url or ""
    d["ai_score"] = creator.ai_score or 0
    d["risk_level"] = creator.risk_level or "Medium"
    d["genres"] = creator.genres or []
    return {
        "status": "success",
        "message": "Campaign found",
        "data": d,
    }


@router.post("/{campaign_id}/invest", status_code=201)
async def invest_in_campaign(
    campaign_id: str,
    request: InvestRequest,
    db: AsyncSession = Depends(get_db),
):
    """Fan paper-invests in a campaign."""
    result = await db.execute(
        select(Campaign).where(Campaign.id == uuid.UUID(campaign_id))
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status != "live":
        raise HTTPException(status_code=400, detail="Campaign is not accepting investments")

    investment = Investment(
        id=uuid.uuid4(),
        campaign_id=campaign.id,
        fan_email=request.fan_email,
        fan_name=request.fan_name,
        amount=request.amount,
    )
    db.add(investment)

    # Update campaign raised_amount and investor_count
    await db.execute(
        update(Campaign)
        .where(Campaign.id == campaign.id)
        .values(
            raised_amount=Campaign.raised_amount + request.amount,
            investor_count=Campaign.investor_count + 1,
        )
    )
    await db.commit()
    await db.refresh(investment)

    return {
        "status": "success",
        "message": "Investment recorded",
        "data": {
            "investment_id": str(investment.id),
            "campaign_id": str(investment.campaign_id),
            "fan_email": investment.fan_email,
            "fan_name": investment.fan_name,
            "amount": investment.amount,
            "invested_at": investment.invested_at.isoformat() if investment.invested_at else None,
        },
    }


@router.get("/my-investments/{fan_email}")
async def my_investments(fan_email: str, db: AsyncSession = Depends(get_db)):
    """List all investments for a fan, joined with campaign + creator data."""
    result = await db.execute(
        select(Investment, Campaign, Creator)
        .join(Campaign, Investment.campaign_id == Campaign.id)
        .join(Creator, Campaign.creator_id == Creator.id)
        .where(Investment.fan_email == fan_email)
        .order_by(Investment.invested_at.desc())
    )
    rows = result.all()
    data = []
    for inv, campaign, creator in rows:
        data.append({
            "investment_id": str(inv.id),
            "campaign_id": str(campaign.id),
            "amount": inv.amount,
            "invested_at": inv.invested_at.isoformat() if inv.invested_at else None,
            "creator_name": creator.name or "",
            "creator_handle": creator.handle or "",
            "creator_thumbnail": creator.thumbnail_url or "",
            "genres": creator.genres or [],
            "term_months": campaign.term_months,
            "revenue_share_pct": campaign.revenue_share_pct,
            "return_low": campaign.return_low or 0,
            "return_base": campaign.return_base or 0,
            "return_high": campaign.return_high or 0,
            "start_date": campaign.start_date,
            "status": campaign.status,
        })
    return {"status": "success", "message": f"{len(data)} investments found", "data": data}


@router.get("/{campaign_id}/investments")
async def list_investments(campaign_id: str, db: AsyncSession = Depends(get_db)):
    """List all investments for a campaign."""
    result = await db.execute(
        select(Investment)
        .where(Investment.campaign_id == uuid.UUID(campaign_id))
        .order_by(Investment.invested_at.desc())
    )
    investments = result.scalars().all()
    return {
        "status": "success",
        "message": f"{len(investments)} investments found",
        "data": [
            {
                "investment_id": str(inv.id),
                "fan_name": inv.fan_name,
                "fan_email": inv.fan_email,
                "amount": inv.amount,
                "invested_at": inv.invested_at.isoformat() if inv.invested_at else None,
                "days_ago": None,  # computed on FE if needed
            }
            for inv in investments
        ],
    }
