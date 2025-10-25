# backend/crud.py
from sqlalchemy.orm import Session
import models, schemas  # FIXED: Absolute imports
from utils.auth import hash_password, verify_password # FIXED: Absolute import and moved verify_password to top
import uuid
from sqlalchemy import func

# -- User operations --
def create_citizen(db: Session, user_in: schemas.UserCreate):
    user = models.User(
        id=user_in.id,  # phone number as id
        name=user_in.name,
        password=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_admin(db: Session, id_code: str, name: str, raw_password: str):
    admin = models.User(
        id=id_code,
        name=name,
        password=hash_password(raw_password),
        role="admin"
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def authenticate_user(db: Session, user_id: str, plain_password: str):
    user = get_user(db, user_id)
    if not user:
        return None
    # Removed relative import here, moved to the top
    if not verify_password(plain_password, user.password):
        return None
    return user

# -- Issue operations --
def create_issue(db: Session, reporter_id: str, title: str, description: str,
                 image_url: str, category: str, latitude: str, longitude: str, location_text: str):
    issue_id = str(uuid.uuid4().hex)  # unique id
    issue = models.Issue(
        id=issue_id,
        reporter_id=reporter_id,
        title=title,
        description=description,
        image_url=image_url,
        category=category,
        latitude=latitude,
        longitude=longitude,
        location_text=location_text,
        status="pending"
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue

def get_issue(db: Session, issue_id: str):
    return db.query(models.Issue).filter(models.Issue.id == issue_id).first()

def list_issues(db: Session, skip=0, limit=100):
    return db.query(models.Issue).order_by(models.Issue.created_at.desc()).offset(skip).limit(limit).all()

def assign_issue(db: Session, issue_id: str, admin_id: str):
    issue = get_issue(db, issue_id)
    if not issue:
        return None
    issue.assigned_to = admin_id
    db.commit()
    db.refresh(issue)
    return issue

def update_issue_status(db: Session, issue_id: str, status: str):
    issue = get_issue(db, issue_id)
    if not issue:
        return None
    issue.status = status
    db.commit()
    db.refresh(issue)
    return issue

# -- Voting & feedback --
def add_vote(db: Session, issue_id: str, user_id: str):
    issue = get_issue(db, issue_id)
    user = get_user(db, user_id)
    if not issue or not user:
        return None
    if user in issue.voters:
        return issue  # already voted
    issue.voters.append(user)
    db.commit()
    db.refresh(issue)
    return issue

def create_feedback(db: Session, fb: schemas.FeedbackCreate):
    feedback = models.Feedback(
        issue_id=fb.issue_id,
        user_id=fb.user_id,
        rating=fb.rating,
        comments=fb.comments
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

# -- Analytics simple --
def analytics_summary(db: Session):
    cat_counts = dict(db.query(models.Issue.category, func.count(models.Issue.id)).group_by(models.Issue.category).all())
    status_counts = dict(db.query(models.Issue.status, func.count(models.Issue.id)).group_by(models.Issue.status).all())
    return {"category_counts": cat_counts, "status_counts": status_counts}