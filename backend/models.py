# backend/models.py
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Table, func
from sqlalchemy.orm import relationship
from database import Base

# Many-to-many for votes: which users voted for which issues
issue_votes = Table(
    "issue_votes",
    Base.metadata,
    Column("issue_id", String, ForeignKey("issues.id"), primary_key=True),
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    # id is string to support phone numbers for citizens and custom admin IDs
    id = Column(String(50), primary_key=True, index=True)  # e.g., '9876543210' or 'AP0202005'
    name = Column(String(100), nullable=True)
    email = Column(String(150), nullable=True, unique=False)  # optional
    password = Column(String(255), nullable=False)  # hashed
    role = Column(String(20), nullable=False)  # 'citizen' or 'admin'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    issues = relationship("Issue", back_populates="reporter", foreign_keys="Issue.reporter_id")
    assigned_issues = relationship("Issue", back_populates="assignee", foreign_keys="Issue.assigned_to")

class Issue(Base):
    __tablename__ = "issues"
    id = Column(String(50), primary_key=True, index=True)  # we'll generate unique id (e.g., UUID)
    reporter_id = Column(String(50), ForeignKey("users.id"))
    title = Column(String(200))
    description = Column(Text)
    image_url = Column(Text)
    category = Column(String(80))
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    location_text = Column(String(255), nullable=True)  # optional address
    status = Column(String(30), default="pending")  # pending, in_progress, resolved
    assigned_to = Column(String(50), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reporter = relationship("User", back_populates="issues", foreign_keys=[reporter_id])
    assignee = relationship("User", back_populates="assigned_issues", foreign_keys=[assigned_to])
    voters = relationship("User", secondary=issue_votes, backref="voted_issues")

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(String(50), ForeignKey("issues.id"))
    user_id = Column(String(50), ForeignKey("users.id"))
    rating = Column(Integer)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())