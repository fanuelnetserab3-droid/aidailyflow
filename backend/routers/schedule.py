from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any
from database import get_db
import models
import auth as auth_utils

router = APIRouter()


class TaskUpdate(BaseModel):
    tasks: List[Any]


@router.get("/{date}")
def get_schedule(
    date: str,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    schedule = db.query(models.Schedule).filter(
        models.Schedule.user_id == current_user.id,
        models.Schedule.date == date,
    ).first()
    if not schedule:
        return {"date": date, "tasks": [], "timeframe": "Idag"}
    return {"date": date, "tasks": schedule.tasks or [], "timeframe": schedule.timeframe or "Idag"}


@router.put("/{date}")
def update_schedule(
    date: str,
    data: TaskUpdate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    schedule = db.query(models.Schedule).filter(
        models.Schedule.user_id == current_user.id,
        models.Schedule.date == date,
    ).first()
    if not schedule:
        schedule = models.Schedule(user_id=current_user.id, date=date, tasks=data.tasks)
        db.add(schedule)
    else:
        schedule.tasks = data.tasks
    db.commit()
    return {"success": True}
