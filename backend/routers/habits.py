from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
import models
import auth as auth_utils

router = APIRouter()


class HabitCreate(BaseModel):
    name: str
    color: Optional[str] = "#14B8A6"


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    completions: Optional[List[str]] = None


@router.get("")
def get_habits(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    habits = db.query(models.Habit).filter(
        models.Habit.user_id == current_user.id
    ).order_by(models.Habit.created_at.asc()).all()

    return [
        {"id": h.id, "name": h.name, "color": h.color, "completions": h.completions or []}
        for h in habits
    ]


@router.post("")
def create_habit(
    data: HabitCreate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    habit = models.Habit(user_id=current_user.id, name=data.name, color=data.color, completions=[])
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return {"id": habit.id, "name": habit.name, "color": habit.color, "completions": []}


@router.put("/{habit_id}")
def update_habit(
    habit_id: int,
    data: HabitUpdate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.user_id == current_user.id,
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Vana hittades inte")

    if data.name is not None:
        habit.name = data.name
    if data.color is not None:
        habit.color = data.color
    if data.completions is not None:
        habit.completions = data.completions

    db.commit()
    return {"success": True}


@router.delete("/{habit_id}")
def delete_habit(
    habit_id: int,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.user_id == current_user.id,
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Vana hittades inte")
    db.delete(habit)
    db.commit()
    return {"success": True}
