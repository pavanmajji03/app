# FanZFolio API Documentation

## Overview
FanZFolio is an AI-powered investment simulator platform for YouTube creators. Fans can make paper investments in their favorite creators and track simulated returns based on AI analysis.

## Base URL
- **Local**: `http://localhost:8001`
- **Production**: `https://quickstart-guide-6.preview.emergentagent.com`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Creator Analysis

### 1. Submit Creator for Analysis
```
POST /api/v1/creators/analyze
```

Submits a YouTube creator for deep AI analysis. Returns immediately with an analysis_id. The analysis runs in the background.

**Request Body:**
```json
{
  "channel_input": "@MrBeast",  // YouTube handle, channel ID, or full URL
  "instagram_username": "mrbeast",  // Optional
  "twitter_handle": "MrBeast",      // Optional
  "tiktok_handle": "mrbeast",       // Optional
  "linkedin_url": "https://..."     // Optional
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Analysis started. Poll /api/v1/creators/analysis/{analysis_id} for results.",
  "data": {
    "analysis_id": "uuid",
    "creator_id": "uuid",
    "status": "pending"
  }
}
```

### 2. Get Analysis Results
```
GET /api/v1/creators/analysis/{analysis_id}
```

Poll this endpoint to check analysis status and retrieve results.

**Status Flow:** `pending` → `processing` → `completed` | `failed`

**Response (Completed):**
```json
{
  "status": "success",
  "message": "Analysis fetched successfully",
  "data": {
    "analysis_id": "uuid",
    "creator_id": "uuid",
    "status": "completed",
    "report": {
      "youtube": {
        "channel": {
          "name": "MrBeast",
          "subscriber_count": 239000000,
          "view_count": 51000000000
        },
        "metrics": {
          "avg_views": 85000000,
          "p10_views": 45000000,
          "p50_views": 80000000,
          "p90_views": 150000000,
          "velocity_trend_pct": 12.5
        }
      },
      "scores": {
        "overall": 92,
        "content": 95,
        "engagement": 88,
        "growth": 90,
        "confidence_score": 85
      },
      "forecast": {
        "timeframes": {
          "30d": {
            "p10": 180000000,
            "p50": 320000000,
            "p90": 600000000,
            "videos_count": 4
          },
          "180d": {...},
          "365d": {...}
        }
      },
      "revenue_proxy": {
        "effective_rpm_usd": 8.5,
        "scenarios_180d": {
          "low": {"views": 900000000, "revenue_usd": 7650000},
          "base": {"views": 1600000000, "revenue_usd": 13600000},
          "high": {"views": 3000000000, "revenue_usd": 25500000}
        }
      },
      "narrative": "MrBeast is the world's most-watched individual creator..."
    },
    "error": null
  }
}
```

### 3. Get Creator Form Data
```
GET /api/v1/creators/{creator_id}/form
```

Returns the onboarding form data for re-populating forms.

---

## Campaigns

### 1. Create Campaign
```
POST /api/v1/campaigns
```

Creator publishes a campaign offering revenue share to fans.

**Request Body:**
```json
{
  "analysis_id": "uuid",
  "term_months": 6,
  "revenue_share_pct": 15.0,
  "target_amount": 50000.0,
  "start_date": "2025-05-01",
  "return_low": 1.15,
  "return_base": 1.45,
  "return_high": 2.10
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Campaign published successfully",
  "data": {
    "campaign_id": "uuid",
    "creator_id": "uuid",
    "status": "live",
    "raised_amount": 0.0,
    "investor_count": 0
  }
}
```

### 2. List All Campaigns (Marketplace)
```
GET /api/v1/campaigns
```

Returns all live campaigns with creator metadata.

**Response:**
```json
{
  "status": "success",
  "message": "15 campaigns found",
  "data": [
    {
      "campaign_id": "uuid",
      "creator_name": "MrBeast",
      "creator_handle": "@MrBeast",
      "creator_thumbnail": "https://...",
      "ai_score": 92,
      "risk_level": "Low",
      "genres": ["Entertainment", "Philanthropy"],
      "subscribers": "239M",
      "avg_views": "~85M",
      "growth_rate": "+12%",
      "term_months": 6,
      "revenue_share_pct": 15.0,
      "target_amount": 50000.0,
      "raised_amount": 12500.0,
      "investor_count": 8,
      "return_low": 1.15,
      "return_base": 1.45,
      "return_high": 2.10
    }
  ]
}
```

### 3. Get Campaign by ID
```
GET /api/v1/campaigns/{campaign_id}
```

### 4. Get Campaign by Analysis ID
```
GET /api/v1/campaigns/by-analysis/{analysis_id}
```

---

## Investments

### 1. Invest in Campaign
```
POST /api/v1/campaigns/{campaign_id}/invest
```

Fan makes a paper investment in a creator's campaign.

**Request Body:**
```json
{
  "fan_email": "fan@example.com",
  "fan_name": "John Doe",
  "amount": 500.0
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Investment recorded",
  "data": {
    "investment_id": "uuid",
    "campaign_id": "uuid",
    "fan_email": "fan@example.com",
    "amount": 500.0,
    "invested_at": "2025-04-16T13:45:00Z"
  }
}
```

### 2. Get My Investments (Portfolio)
```
GET /api/v1/campaigns/my-investments/{fan_email}
```

Returns all investments for a fan.

**Response:**
```json
{
  "status": "success",
  "message": "5 investments found",
  "data": [
    {
      "investment_id": "uuid",
      "campaign_id": "uuid",
      "amount": 500.0,
      "invested_at": "2025-04-16T13:45:00Z",
      "creator_name": "MrBeast",
      "creator_handle": "@MrBeast",
      "creator_thumbnail": "https://...",
      "genres": ["Entertainment"],
      "term_months": 6,
      "revenue_share_pct": 15.0,
      "return_low": 1.15,
      "return_base": 1.45,
      "return_high": 2.10,
      "start_date": "2025-05-01",
      "status": "live"
    }
  ]
}
```

### 3. List Campaign Investments
```
GET /api/v1/campaigns/{campaign_id}/investments
```

Returns all investments for a specific campaign.

---

## Genres

### Get All Genres
```
GET /api/v1/genres
```

Returns all available content genres.

**Response:**
```json
{
  "status": "success",
  "message": "30 genres",
  "data": [
    "AI", "Beauty", "Business", "Comedy", "Cooking", "Education",
    "Entertainment", "Entrepreneurship", "Esports", "Fashion",
    "Finance", "Fitness", "Food", "Gaming", "Health", "Investing",
    "Learning", "Lifestyle", "Music", "News", "Politics", "Recipes",
    "Science", "Software", "Sports", "Tech", "Travel", "Tutorials",
    "Vlogging", "Wellness"
  ]
}
```

---

## Data Collection Sources

The AI analysis aggregates data from multiple sources:

1. **YouTube Data API** - Channel stats, video metrics, growth trends
2. **Instagram Business API** - Engagement, follower data
3. **Google Trends** - Search interest over time
4. **News APIs** - Media mentions, sentiment
5. **Apify Scrapers** - Twitter, TikTok, LinkedIn presence
6. **Claude AI** - Synthesis, risk assessment, forecasting

---

## Analysis Scoring

### Overall Score (0-100)
- **80-100**: Low Risk - Established creator with consistent performance
- **70-79**: Low-Med Risk - Strong track record with minor concerns
- **60-69**: Medium Risk - Moderate variability or limited history
- **0-59**: High Risk - High volatility or insufficient data

### Sub-Scores
- **Content**: Video quality, production value, uniqueness
- **Engagement**: Likes, comments, shares, community strength
- **Growth**: Subscriber and view velocity trends
- **Confidence**: Data completeness and source coverage

---

## Return Projections

### Scenarios (P10/P50/P90)
- **P10 (Low)**: Conservative - 10th percentile outcome
- **P50 (Base)**: Expected - 50th percentile, most likely
- **P90 (High)**: Optimistic - 90th percentile, best case

### Calculation Methodology
1. Historical view distribution analysis (last 50 videos)
2. Upload cadence and consistency scoring
3. Velocity trend adjustment (dampened to avoid over-projection)
4. Claude AI forecast multipliers based on:
   - Content momentum signals
   - Social media trajectory
   - News sentiment and controversy flags
   - Niche-specific benchmarks
5. Revenue proxy using effective RPM (Revenue Per Mille views)

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `202` - Accepted (background task started)
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

External API rate limits:
- **YouTube API**: 10,000 quota units/day
- **Claude AI**: Token-based billing
- **News APIs**: Varies by plan

Consider implementing request queuing for high-volume scenarios.

---

## Development

### Running Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8001
```

### Environment Variables
See `.env` file for required API keys:
- `YOUTUBE_API_KEY`
- `ANTHROPIC_API_KEY`
- `GROQ_API_KEY` (fallback)
- `INSTAGRAM_ACCESS_TOKEN`
- `APIFY_API_KEY`
- `NEWS_API_KEY`
- `SERPER_API_KEY`

---

## Support

For issues or questions, refer to the main README.md or contact the development team.
