import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
import models
from sqlalchemy import inspect, text

Base.metadata.create_all(bind=engine)


def _migrate(eng):
    inspector = inspect(eng)
    tables = inspector.get_table_names()
    if "schedules" in tables:
        cols = [c["name"] for c in inspector.get_columns("schedules")]
        if "timeframe" not in cols:
            with eng.connect() as conn:
                conn.execute(text("ALTER TABLE schedules ADD COLUMN timeframe VARCHAR DEFAULT 'Idag'"))
                conn.commit()

    if "profiles" in tables:
        cols = [c["name"] for c in inspector.get_columns("profiles")]
        if "raw" not in cols:
            with eng.connect() as conn:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN raw JSON DEFAULT '{}'"))
                conn.commit()

    if "users" in tables:
        cols = [c["name"] for c in inspector.get_columns("users")]
        if "trial_started_at" not in cols:
            try:
                with eng.connect() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN trial_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
                    conn.commit()
            except Exception:
                pass
        if "is_subscribed" not in cols:
            try:
                with eng.connect() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_subscribed BOOLEAN DEFAULT FALSE"))
                    conn.commit()
            except Exception:
                pass


_migrate(engine)

from routers import auth, profile, chat, schedule, thoughts, lists, habits, milestones, subscription

app = FastAPI(title="AiDailyFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API-routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["schedule"])
app.include_router(thoughts.router, prefix="/api/thoughts", tags=["thoughts"])
app.include_router(lists.router, prefix="/api/lists", tags=["lists"])
app.include_router(habits.router, prefix="/api/habits", tags=["habits"])
app.include_router(milestones.router, prefix="/api/milestones", tags=["milestones"])
app.include_router(subscription.router, prefix="/api/subscription", tags=["subscription"])


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "AiDailyFlow"}


# Serva React-appen (frontend/dist) i produktion
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "AiDailyFlow API körs"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
