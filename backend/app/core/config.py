from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "FanFolio"
    debug: bool = False

    # Database
    database_url: str

    # YouTube
    youtube_api_key: str = ""

    # Instagram
    instagram_access_token: str = ""
    instagram_business_account_id: str = ""
    instagram_api_version: str = "v19.0"

    # Apify (Instagram, TikTok, X, LinkedIn scraping)
    apify_api_key: str = ""
    apify_actor_twitter: str = "apidojo/tweet-scraper"
    apify_actor_instagram: str = "apify/instagram-scraper"
    apify_actor_tiktok: str = "clockworks/tiktok-profile-scraper"
    apify_actor_linkedin: str = "curious_coder/linkedin-profile-scraper"

    # X / Twitter
    twitter_bearer_token: str = ""

    # News & Search
    news_api_key: str = ""
    serper_api_key: str = ""

    # AI (Groq - fallback)
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # AI (Anthropic Claude - primary)
    anthropic_api_key: str = ""
    claude_model: str = "claude-opus-4-6"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
