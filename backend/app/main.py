from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.db.session import Base, engine, AsyncSessionLocal
from app.models import CreatorAnalysis, Creator, Campaign, Investment  # noqa: F401
from app.models.genre import Genre
from app.routers import creators, campaigns, genres

# All genres that ship with the platform — new ones are added dynamically during analysis
_SEED_GENRES = [
    "AI", "Beauty", "Business", "Comedy", "Cooking", "Education",
    "Entertainment", "Entrepreneurship", "Esports", "Fashion", "Finance",
    "Fitness", "Food", "Gaming", "Health", "Investing", "Learning",
    "Lifestyle", "Music", "News", "Politics", "Recipes", "Science",
    "Software", "Sports", "Tech", "Travel", "Tutorials", "Vlogging", "Wellness",
]


async def _seed_genres():
    async with AsyncSessionLocal() as db:
        for name in _SEED_GENRES:
            exists = await db.execute(select(Genre).where(Genre.name == name))
            if not exists.scalar_one_or_none():
                db.add(Genre(name=name))
        await db.commit()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _seed_genres()
    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://fanzfolio.com",
        "https://quickstart-guide-6.preview.emergentagent.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(creators.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(genres.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
