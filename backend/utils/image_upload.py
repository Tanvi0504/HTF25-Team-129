# backend/utils/image_upload.py
import os, shutil, uuid
from fastapi import UploadFile

BASE_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")
os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)

def save_upload_file(upload_file: UploadFile) -> str:
    """Save UploadFile and return relative path to static folder (for DB)."""
    ext = os.path.splitext(upload_file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(BASE_UPLOAD_DIR, filename)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    # Return path relative to backend root; in production create absolute URL
    return f"/static/uploads/{filename}"
