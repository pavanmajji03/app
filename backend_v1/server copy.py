from app.main import app  # noqa: F401

# Entry point for uvicorn / Emergent
# Run: uvicorn server:app --reload --port 8000

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
