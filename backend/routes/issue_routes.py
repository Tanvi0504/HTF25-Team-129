# backend/routes/issue_routes.py
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, Header
from sqlalchemy.orm import Session
from database import SessionLocal
# FIX: Only import the schemas needed for this file and use them directly.
from schemas import IssueOut, IssueCreate, FeedbackCreate 
import crud
from utils.image_upload import save_upload_file
from ai.predict import predict_issue_category_from_image
from utils.notifications import send_notification_console
from utils.auth import decode_token
from typing import Optional, List # Added List import for clarity if using Python < 3.9

router = APIRouter(prefix="/issues", tags=["issues"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create issue (multipart). Frontend should send Authorization header or pass token field.
@router.post("/", response_model=IssueOut) # FIX: Removed schemas.
async def create_issue(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    location_text: Optional[str] = Form(None),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
    token: Optional[str] = Form(None),  # fallback to form token
    image: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # get token from Authorization header if present
    token_value = None
    if authorization and authorization.lower().startswith("bearer "):
        token_value = authorization.split(" ", 1)[1]
    elif token:
        token_value = token
    else:
        raise HTTPException(status_code=401, detail="Authorization token required")

    payload = decode_token(token_value)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    reporter_id = payload.get("sub")

    # save image
    image_url = save_upload_file(image)

    # simple AI predict
    category, confidence = predict_issue_category_from_image(image_url)

    issue = crud.create_issue(
        db=db,
        reporter_id=reporter_id,
        title=title,
        description=description,
        image_url=image_url,
        category=category,
        latitude=latitude,
        longitude=longitude,
        location_text=location_text
    )

    # notify reporter (console for demo)
    send_notification_console(reporter_id, f"Issue {issue.id} reported successfully with category {category} (conf {confidence})")

    return issue

@router.get("/", response_model=List[IssueOut]) # FIX: Removed schemas., using List for Python < 3.9 compatibility
def list_issues(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.list_issues(db, skip=skip, limit=limit)
    return items

@router.get("/my", response_model=List[IssueOut]) # FIX: Removed schemas.
def my_issues(token: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not token or not token.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization header with bearer token required")
    payload = decode_token(token.split(" ", 1)[1])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    # simple filter
    all_issues = crud.list_issues(db, skip=0, limit=1000)
    return [i for i in all_issues if i.reporter_id == user_id]

@router.put("/{issue_id}/assign")
def assign_issue(issue_id: str, admin_id: str = Form(...), token: Optional[str] = Header(None), db: Session = Depends(get_db)):
    # Only admin can assign
    if not token or not token.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization required")
    payload = decode_token(token.split(" ", 1)[1])
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    issue = crud.assign_issue(db, issue_id, admin_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    send_notification_console(issue.reporter_id, f"Issue {issue.id} has been assigned to {admin_id}.")
    return {"status": "assigned", "issue_id": issue.id, "assigned_to": admin_id}

@router.put("/{issue_id}/status")
def change_status(issue_id: str, status: str = Form(...), token: Optional[str] = Header(None), db: Session = Depends(get_db)):
    # Admin or assigned officer can update status
    if not token or not token.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization required")
    payload = decode_token(token.split(" ", 1)[1])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    role = payload.get("role")
    issue = crud.get_issue(db, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    # Check permission: admin or assigned_to
    if role != "admin" and issue.assigned_to != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to change status")
    updated = crud.update_issue_status(db, issue_id, status)
    send_notification_console(issue.reporter_id, f"Issue {issue.id} status updated to {status}")
    return {"status": "updated", "issue_id": issue.id, "new_status": status}

@router.post("/{issue_id}/vote")
def vote_issue(issue_id: str, token: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not token or not token.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization required")
    payload = decode_token(token.split(" ", 1)[1])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    issue = crud.add_vote(db, issue_id, user_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue or user not found")
    return {"status": "voted", "issue_id": issue_id}