from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from database import get_db
import models
import auth as auth_utils

router = APIRouter()

TRIAL_DAYS = 7


def get_trial_status(user: models.User) -> dict:
    """Returnerar trial-status för en användare."""
    if user.is_subscribed:
        return {"status": "subscribed", "days_left": None, "trial_expired": False}

    start = user.trial_started_at or user.created_at
    if start is None:
        return {"status": "trial", "days_left": TRIAL_DAYS, "trial_expired": False}

    # Gör start timezone-aware om den inte är det
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    elapsed = (now - start).days
    days_left = max(0, TRIAL_DAYS - elapsed)
    expired = days_left == 0

    return {
        "status": "trial_expired" if expired else "trial",
        "days_left": days_left,
        "trial_expired": expired,
    }


@router.get("/status")
def subscription_status(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    return get_trial_status(current_user)
