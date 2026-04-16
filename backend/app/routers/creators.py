import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.analysis import CreatorAnalysis
from app.models.creator import Creator
from app.schemas.creator import AnalyzeRequest
from app.services import analyzer
from app.services.formatter import build_report

router = APIRouter(prefix="/creators", tags=["creators"])


@router.post("/analyze", status_code=202)
async def analyze_creator(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a creator for analysis. Returns immediately with an analysis_id.
    Poll GET /creators/analysis/{analysis_id} for results.

    channel_input accepts:
    - YouTube channel ID: UCxxxxxx
    - YouTube handle: @MrBeast
    - Full YouTube URL: https://www.youtube.com/@MrBeast
    """
    creator_id = uuid.uuid4()
    analysis_id = uuid.uuid4()

    creator = Creator(
        id=creator_id,
        youtube_url=request.channel_input,
        instagram_username=request.instagram_username,
        twitter_handle=request.twitter_handle,
        tiktok_handle=request.tiktok_handle,
        linkedin_url=request.linkedin_url,
    )
    db.add(creator)

    analysis = CreatorAnalysis(
        id=analysis_id,
        creator_id=creator_id,
        status="pending",
    )
    db.add(analysis)
    await db.commit()

    background_tasks.add_task(
        analyzer.run_analysis,
        analysis_id=str(analysis_id),
        creator_id=str(creator_id),
        channel_input=request.channel_input,
        instagram_username=request.instagram_username,
        twitter_handle=request.twitter_handle,
        tiktok_handle=request.tiktok_handle,
        linkedin_url=request.linkedin_url,
    )

    return {
        "status": "success",
        "message": "Analysis started. Poll /api/v1/creators/analysis/{} for results.".format(analysis_id),
        "data": {
            "analysis_id": str(analysis_id),
            "creator_id": str(creator_id),
            "status": "pending",
        },
    }


@router.get("/{creator_id}/form")
async def get_creator_form(creator_id: str, db: AsyncSession = Depends(get_db)):
    """Return the onboarding form fields for a creator (for pre-population on re-run)."""
    creator = await db.get(Creator, uuid.UUID(creator_id))
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return {
        "status": "success",
        "message": "Creator form data fetched",
        "data": {
            "youtube_url": creator.youtube_url,
            "instagram_username": creator.instagram_username,
            "twitter_handle": creator.twitter_handle,
            "tiktok_handle": creator.tiktok_handle,
            "linkedin_url": creator.linkedin_url,
        },
    }


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    """
    Poll this endpoint for analysis results.
    Status: pending → processing → completed | failed
    """
    analysis = await db.get(CreatorAnalysis, uuid.UUID(analysis_id))
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    report = None
    if analysis.status == "completed":
        report = await build_report(
            youtube_data=analysis.youtube_data,
            instagram_data=analysis.instagram_data,
            trends_data=analysis.trends_data,
            social_data=analysis.social_data,
            scores=analysis.scores,
            forecast=analysis.forecast,
            revenue_proxy=analysis.revenue_proxy,
            narrative=analysis.narrative,
            controversy_signals=analysis.controversy_signals,
        )

    return {
        "status": "success",
        "message": "Analysis fetched successfully",
        "data": {
            "analysis_id": str(analysis.id),
            "creator_id": str(analysis.creator_id),
            "status": analysis.status,
            "report": report,
            "error": analysis.error,
        },
    }
