import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
import models
import auth as auth_utils
from agent.engine import run_agent

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    profile: Optional[dict] = None


@router.get("/history")
def get_history(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    msgs = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at)
        .all()
    )
    return [{"id": m.id, "role": m.role, "content": m.content} for m in msgs]


@router.delete("/history")
def clear_history(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).delete()
    db.commit()
    return {"success": True}


@router.post("")
async def chat(
    request: ChatRequest,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key == "placeholder":
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY saknas. Lägg till din nyckel i backend/.env och starta om servern.",
        )

    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    reply = run_agent(messages, current_user.id, db)

    # Persist conversation
    if messages:
        last = messages[-1]
        db.add(models.ChatMessage(user_id=current_user.id, role=last["role"], content=last["content"]))
    db.add(models.ChatMessage(user_id=current_user.id, role="assistant", content=reply))
    db.commit()

    return {"reply": reply, "raw": reply}
