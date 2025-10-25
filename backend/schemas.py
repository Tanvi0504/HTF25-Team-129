# backend/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---- User ----
class UserBase(BaseModel):
    id: str = Field(..., description="Phone number for citizens or admin code for admins")
    name: Optional[str]

class UserCreate(UserBase):
    password: str
    role: str = Field(..., regex="^(citizen|admin)$")

class UserOut(BaseModel):
    id: str
    name: Optional[str]
    role: str
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    id: str
    password: str

# ---- Token ----
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---- Issue ----
class IssueCreate(BaseModel):
    title: str
    description: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    location_text: Optional[str] = None

class IssueOut(BaseModel):
    id: str
    reporter_id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]
    category: Optional[str]
    latitude: Optional[str]
    longitude: Optional[str]
    location_text: Optional[str]
    status: str
    assigned_to: Optional[str]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

# ---- Feedback ----
class FeedbackCreate(BaseModel):
    issue_id: str
    user_id: str
    rating: int
    comments: Optional[str] = None

class FeedbackOut(BaseModel):
    id: int
    issue_id: str
    user_id: str
    rating: int
    comments: Optional[str]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

# ---- Analytics simple ----
class AnalyticsOut(BaseModel):
    category_counts: dict
    status_counts: dict
