from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.genre import Genre

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("")
async def list_genres(db: AsyncSession = Depends(get_db)):
    """Return all genres sorted alphabetically."""
    result = await db.execute(select(Genre.name).order_by(Genre.name))
    names = [row[0] for row in result.all()]
    return {"status": "success", "message": f"{len(names)} genres", "data": names}
