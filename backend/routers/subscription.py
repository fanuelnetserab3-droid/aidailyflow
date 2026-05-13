from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from database import get_db
import models
import auth as auth_utils
import os
import stripe

router = APIRouter()

TRIAL_DAYS = 7

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Developer/admin accounts — never locked out
ADMIN_EMAILS = {"fanuelnetserab3@gmail.com"}


def get_trial_status(user: models.User) -> dict:
    """Returnerar trial-status för en användare."""
    # Admin accounts always have full access
    if user.email in ADMIN_EMAILS:
        return {"status": "subscribed", "days_left": None, "trial_expired": False}

    if user.is_subscribed:
        return {"status": "subscribed", "days_left": None, "trial_expired": False}

    start = user.trial_started_at or user.created_at
    if start is None:
        return {"status": "trial", "days_left": TRIAL_DAYS, "trial_expired": False}

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


@router.post("/create-checkout")
def create_checkout(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    price_id = os.getenv("STRIPE_PRICE_ID")
    frontend_url = os.getenv("FRONTEND_URL", "https://aidailyflow.org")

    if not price_id:
        raise HTTPException(status_code=500, detail="STRIPE_PRICE_ID saknas i miljövariabler")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            customer_email=current_user.email,
            success_url=f"{frontend_url}/idag?subscribed=true",
            cancel_url=f"{frontend_url}/prenumerera",
            metadata={"user_id": str(current_user.id)},
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        user_id = session_obj.get("metadata", {}).get("user_id")
        if user_id:
            user = db.query(models.User).filter(models.User.id == int(user_id)).first()
            if user:
                user.is_subscribed = True
                db.commit()

    elif event["type"] in ["customer.subscription.deleted", "customer.subscription.paused"]:
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")
        if customer_id:
            try:
                customer = stripe.Customer.retrieve(customer_id)
                email = customer.get("email")
                if email:
                    user = db.query(models.User).filter(models.User.email == email).first()
                    if user:
                        user.is_subscribed = False
                        db.commit()
            except Exception:
                pass

    return {"status": "ok"}
