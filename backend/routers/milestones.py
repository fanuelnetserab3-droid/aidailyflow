from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any
from database import get_db
import models
import auth as auth_utils

router = APIRouter()


class MilestonesUpdate(BaseModel):
    data: List[Any]


@router.get("")
def get_milestones(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    m = db.query(models.Milestone).filter(models.Milestone.user_id == current_user.id).first()
    return {"data": m.data if m else []}


@router.put("")
def update_milestones(
    body: MilestonesUpdate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    m = db.query(models.Milestone).filter(models.Milestone.user_id == current_user.id).first()
    if m:
        m.data = body.data
    else:
        m = models.Milestone(user_id=current_user.id, data=body.data)
        db.add(m)
    db.commit()
    return {"data": m.data}
