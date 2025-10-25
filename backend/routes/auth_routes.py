# backend/routes/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
# Correct: Classes are imported directly into the namespace
from schemas import UserCreate, UserLogin, Token, UserOut 
import crud
from utils.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", response_model=UserOut) # FIX: Removed schemas.
def signup(user_in: UserCreate, db: Session = Depends(get_db)): # FIX: Removed schemas.
    # For citizens: id must be phone number and unique.
    # Assuming 'crud' and 'utils/auth' imports are correct, 
    # and all necessary classes are used in 'crud' and 'utils/auth' with their correct imports.
    if crud.get_user(db, user_in.id):
        raise HTTPException(status_code=400, detail="User ID already exists")
    user = crud.create_citizen(db, user_in)
    return user

@router.post("/login", response_model=Token) # FIX: Removed schemas. (Assuming Token is the correct class)
def login(form_data: UserLogin, db: Session = Depends(get_db)): # FIX: Removed schemas.
    user = crud.authenticate_user(db, form_data.id, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=user.id, role=user.role)
    return {"access_token": token, "token_type": "bearer"}