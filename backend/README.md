# FanFolio
FanFolio: AI underwriting + paper-portfolio simulator for "investing" in YouTube creators (channel-level MVP). Pulls public YouTube data, adds optional social/trend signals, forecasts Low/Base/High (P10/P50/P90) views + revenue proxy, powers campaign pages, IOIs, portfolios, and monthly simulated payout statements.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Database Setup (run once, and after every `git pull`)

```bash
# Fresh setup — creates all tables from scratch
alembic upgrade head

# If you have an existing DB created before Alembic was set up (stamp first)
alembic stamp ca52dfcce72d
alembic upgrade head
```

## Run

```bash
uvicorn app.main:app --reload
```
