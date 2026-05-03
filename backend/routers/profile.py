from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models
import auth as auth_utils

router = APIRouter()


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    kon: Optional[str] = None
    situation: Optional[str] = None
    boendeort: Optional[str] = None
    familj: Optional[str] = None
    traning: Optional[str] = None
    aktiviteter: Optional[str] = None
    somn: Optional[str] = None
    halsa: Optional[str] = None
    mal: Optional[str] = None
    motivation: Optional[str] = None
    disciplin: Optional[str] = None
    tid_per_dag: Optional[str] = None
    budget: Optional[str] = None
    larande: Optional[str] = None
    produktivitet: Optional[str] = None
    goals: Optional[List[str]] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    time_per_day: Optional[str] = None
    discipline: Optional[str] = None
    work_style: Optional[str] = None
    completed: Optional[bool] = None
    done_today: Optional[int] = None
    week_average: Optional[int] = None
    streak: Optional[int] = None

    model_config = {"extra": "allow"}


def get_or_create_profile(db: Session, user_id: int) -> models.Profile:
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        profile = models.Profile(user_id=user_id, raw={})
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def serialize_profile(profile: models.Profile) -> dict:
    data = dict(profile.raw or {})
    data["id"] = profile.id

    if profile.name is not None:
        data["name"] = profile.name
    if profile.age is not None:
        data["age"] = profile.age
    if profile.situation is not None:
        data["situation"] = profile.situation
    if profile.goals is not None:
        data["goals"] = profile.goals
    if profile.education is not None:
        data["education"] = profile.education
    if profile.experience is not None:
        data["experience"] = profile.experience
    if profile.budget is not None:
        data["budget"] = profile.budget
    if profile.time_per_day is not None:
        data["time_per_day"] = profile.time_per_day
    if profile.discipline is not None:
        data["discipline"] = profile.discipline
    if profile.work_style is not None:
        data["work_style"] = profile.work_style
    if profile.completed is not None:
        data["completed"] = profile.completed

    data.setdefault("goals", [])
    data.setdefault("completed", False)
    data.setdefault("done_today", 0)
    data.setdefault("week_average", 0)
    data.setdefault("streak", 0)
    return data


@router.get("")
def get_profile(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_or_create_profile(db, current_user.id)
    return serialize_profile(profile)


@router.get("/{user_id}")
def get_profile_by_id(
    user_id: str,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="user_id måste vara ett heltal")
    if current_user.id != uid:
        raise HTTPException(status_code=403, detail="Du kan endast se din egen profil")
    profile = get_or_create_profile(db, uid)
    return serialize_profile(profile)


@router.post("")
def update_profile(
    data: ProfileUpdate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_or_create_profile(db, current_user.id)
    payload = data.model_dump(exclude_none=True)
    raw_updates = {}
    for field, value in payload.items():
        if hasattr(profile, field):
            setattr(profile, field, value)
        else:
            raw_updates[field] = value

    if raw_updates:
        profile.raw = {**(profile.raw or {}), **raw_updates}

    db.commit()
    db.refresh(profile)
    return {"success": True, "completed": profile.completed}


@router.put("/{user_id}")
def put_profile(
    user_id: str,
    data: ProfileUpdate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="user_id måste vara ett heltal")
    if current_user.id != uid:
        raise HTTPException(status_code=403, detail="Du kan endast uppdatera din egen profil")
    profile = get_or_create_profile(db, uid)
    payload = data.model_dump(exclude_none=True)
    raw_updates = {}
    for field, value in payload.items():
        if hasattr(profile, field):
            setattr(profile, field, value)
        else:
            raw_updates[field] = value

    if raw_updates:
        profile.raw = {**(profile.raw or {}), **raw_updates}

    db.commit()
    db.refresh(profile)
    return {"success": True, "completed": profile.completed}
