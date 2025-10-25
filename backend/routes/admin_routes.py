# backend/routes/admin_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
# FIX: Changed schema import to include UserOut, which is needed for the response_model.
from schemas import UserOut, UserCreate 
import crud
import os

router = APIRouter(prefix="/admin", tags=["admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_admin_id(state_code: str, district_code: str, dept_code: str, person_no: int) -> str:
    """
    Format: STATE(2 letters uppercase) + DIST(2 digits) + DEPT(2 digits) + PERSON(3 digits)
    Example: AP (state) 02 (district) 02 (dept) 005 (person) -> AP0202005
    """
    state = state_code.upper()
    district = str(district_code).zfill(2)
    dept = str(dept_code).zfill(2)
    person = str(person_no).zfill(3)
    return f"{state}{district}{dept}{person}"

@router.post("/seed_create", response_model=UserOut) # Using UserOut to return the created user
def seed_create_admin(state_code: str, district_code: int, dept_code: int, person_no: int, name: str, raw_password: str, db: Session = Depends(get_db), seed_key: str = None):
    """
    Protected endpoint to create an admin account using ADMIN_SEED_KEY env var.
    Use only in initial setup or controlled environment (hackathon).
    """
    ADMIN_SEED_KEY = os.getenv("ADMIN_SEED_KEY", "please-change-me")
    if seed_key != ADMIN_SEED_KEY:
        raise HTTPException(status_code=401, detail="Invalid seed key")
    
    admin_id = generate_admin_id(state_code, district_code, dept_code, person_no)
    
    # crud.get_user and crud.create_admin are assumed to be correctly defined in crud.py
    if crud.get_user(db, admin_id):
        raise HTTPException(status_code=400, detail="Admin ID already exists")
    
    admin = crud.create_admin(db, admin_id, name, raw_password)
    
    # Returning the admin object, which will be validated by response_model=UserOut
    return admin