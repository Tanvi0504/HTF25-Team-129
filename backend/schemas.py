from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ---------- User ----------
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str
    role: str

class UserOut(UserBase):
    id: int
    role: str
    class Config:
        orm_mode = True  # allows returning SQLAlchemy models directly

# ---------- Token ----------
class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    email: str
    password: str

# ---------- Issue ----------
class IssueBase(BaseModel):
    title: str
    description: str
    location: str
    category: Optional[str] = None

class IssueCreate(IssueBase):
    image_url: Optional[str] = None

class IssueOut(IssueBase):
    id: int
    user_id: int
    image_url: str
    status: str
    created_at: datetime
    class Config:
        orm_mode = True

# ---------- Feedback ----------
class FeedbackBase(BaseModel):
    rating: int
    comments: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    issue_id: int

class FeedbackOut(FeedbackBase):
    id: int
    issue_id: int
    created_at: datetime
    class Config:
        orm_mode = True
