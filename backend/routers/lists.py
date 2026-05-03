from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Any, Optional
from database import get_db
import models
import auth as auth_utils

router = APIRouter()


class ListCreate(BaseModel):
    title: str


class ListUpdate(BaseModel):
    title: Optional[str] = None
    items: Optional[List[Any]] = None


@router.get("")
def get_lists(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    lists = db.query(models.TaskList).filter(
        models.TaskList.user_id == current_user.id
    ).order_by(models.TaskList.created_at.desc()).all()

    return [
        {"id": l.id, "title": l.title, "items": l.items or [], "created_at": l.created_at.isoformat()}
        for l in lists
    ]


@router.post("")
def create_list(
    data: ListCreate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    task_list = models.TaskList(user_id=current_user.id, title=data.title, items=[])
    db.add(task_list)
    db.commit()
    db.refresh(task_list)
    return {"id": task_list.id, "title": task_list.title, "items": [], "created_at": task_list.created_at.isoformat()}


@router.put("/{list_id}")
def update_list(
    list_id: int,
    data: ListUpdate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    task_list = db.query(models.TaskList).filter(
        models.TaskList.id == list_id,
        models.TaskList.user_id == current_user.id,
    ).first()
    if not task_list:
        raise HTTPException(status_code=404, detail="Lista hittades inte")

    if data.title is not None:
        task_list.title = data.title
    if data.items is not None:
        task_list.items = data.items

    db.commit()
    return {"success": True}


@router.delete("/{list_id}")
def delete_list(
    list_id: int,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    task_list = db.query(models.TaskList).filter(
        models.TaskList.id == list_id,
        models.TaskList.user_id == current_user.id,
    ).first()
    if not task_list:
        raise HTTPException(status_code=404, detail="Lista hittades inte")
    db.delete(task_list)
    db.commit()
    return {"success": True}
