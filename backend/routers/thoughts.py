from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
import models
import auth as auth_utils

router = APIRouter()


class ThoughtCreate(BaseModel):
    content: str


@router.get("")
def get_thoughts(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    thoughts = db.query(models.Thought).filter(
        models.Thought.user_id == current_user.id
    ).order_by(models.Thought.created_at.desc()).all()

    return [
        {"id": t.id, "content": t.content, "created_at": t.created_at.isoformat()}
        for t in thoughts
    ]


@router.post("")
def create_thought(
    data: ThoughtCreate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    thought = models.Thought(user_id=current_user.id, content=data.content)
    db.add(thought)
    db.commit()
    db.refresh(thought)
    return {"id": thought.id, "content": thought.content, "created_at": thought.created_at.isoformat()}


@router.delete("/{thought_id}")
def delete_thought(
    thought_id: int,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    thought = db.query(models.Thought).filter(
        models.Thought.id == thought_id,
        models.Thought.user_id == current_user.id,
    ).first()
    if not thought:
        raise HTTPException(status_code=404, detail="Tanke hittades inte")
    db.delete(thought)
    db.commit()
    return {"success": True}
