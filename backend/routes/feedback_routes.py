# backend/routes/feedback_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import crud, schemas

router = APIRouter(prefix="/feedback", tags=["feedback"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.FeedbackOut)
def create_feedback(fb_in: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    # Basic validation could be added (e.g., user reported this issue earlier)
    fb = crud.create_feedback(db, fb_in)
    if not fb:
        raise HTTPException(status_code=400, detail="Could not create feedback")
    return fb
